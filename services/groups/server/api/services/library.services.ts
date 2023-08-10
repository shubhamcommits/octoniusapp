import { Page, File, Collection, Comment, User } from "../models";
import { Readable } from 'stream';
import { axios } from '../../utils';
import { DateTime } from 'luxon';
import moment from "moment";
import got from "got";
import { minioClient } from "../../utils/minio-client";

const { convertHtmlToDelta } = require('node-quill-converter');

const minio = require('minio');

/*  ===============================
 *  -- Library Service --
 *  ===============================
 */
export class LibraryService {

  async deleteCollection(collectionId: string, workspaceId: string) {
    const collection: any = await Collection.findByIdAndRemove(
        { _id: collectionId }
      ).lean();

    const finalpath = `${collection.collection_avatar}`;

    await minioClient.removeObject(workspaceId, finalpath, (error) => {
      if (error) {
        throw (error);
      }
    });

    let pagesStream: any = Readable.from(await Page.find({ _collection: collectionId }).select('_id').lean());
    
    await pagesStream.on('data', async (page: any) => {
      this.deletePage(page?._id, workspaceId);
    });

    // await Page.deleteMany({ _collection: collectionId });

    this.deleteCollectionFiles(workspaceId, collectionId);
  }

  async updateCollectionImage(collectionId: string, workspaceId: string, fileName: string) {

    let collection = await Collection.findById({
          _id: collectionId
      }).select('collection_avatar').lean();

    if (collection && collection.collection_avatar) {
      // Remove previuos image
      const finalpath = `${collection.collection_avatar}`
      await minioClient.removeObject(workspaceId, finalpath, (error) => {});
    }
    
    collection = await Collection.findByIdAndUpdate({
          _id: collectionId
      }, {
          collection_avatar: fileName
      }, {
          new: true
      })
      .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
      .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
      .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
      .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
      .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
      .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
      .lean();

    return collection;
  }

  async deleteCollectionFile(fileId: string, workspaceId: string) {
    const file = await File.findOne({ _id: fileId }).lean();

    const finalpath = `${file.modified_name}`;

    await minioClient.removeObject(workspaceId, finalpath, (error) => {
      if (error) {
        throw (error);
      }
    });

    await Collection.findOneAndUpdate(
        { _id: file._collection },
        { 
          $pull: { _files: fileId },
        },
        { new: true }
      );

    await File.findByIdAndRemove({ _id: fileId });

    return file;
  }

  async deletePage(pageId: string, workspaceId: string) {
    let pagesStream: any = Readable.from(await Page.find({ _parent: pageId }).select('_id').lean());
    
    await pagesStream.on('data', async (page: any) => {
      this.deletePage(page?._id, workspaceId);
    });

    await this.deletePageFiles(workspaceId, pageId);

    await Comment.deleteMany({ _page: pageId });

    await Page.findByIdAndRemove({
        _id: pageId
    });
  };

  async deleteCollectionFiles(workspaceId: string, collectionId: string) {

    const files = await File.find({ _collection: collectionId }).lean();

    files.forEach(async (filepath) => {
      const finalpath = `${filepath.modified_name}`;

      await minioClient.removeObject(workspaceId, finalpath, (error) => {
        if (error) {
          throw (error);
        }
      });
    });

    await File.deleteMany({ _collection: collectionId });
  };

  async deletePageFiles(workspaceId: string, pageId: string) {

    const files = await File.find({ _page: pageId }).lean();

    files.forEach(async (filepath) => {
      const finalpath = `${filepath.modified_name}`;

      await minioClient.removeObject(workspaceId, finalpath, (error) => {
        if (error) {
          throw (error);
        }
      });
    });

    await File.deleteMany({ _page: pageId });
  };

  async deletePageFile(fileId: string, workspaceId: string) {
    const file = await File.findOne({ _id: fileId }).lean();

    const finalpath = `${file.modified_name}`;

    await minioClient.removeObject(workspaceId, finalpath, (error) => {
      if (error) {
        throw (error);
      }
    });

    await Page.findOneAndUpdate(
        { _id: file._page },
        { 
          $pull: { _files: fileId },
        },
        { new: true }
      );

    await File.findByIdAndRemove({ _id: fileId });

    return file;
  }

  async exportConfluenceSpaceDetailsToCollection(domain: string, space: string, email: string, userId: string, groupId: string, workspaceId: string) {
    let collections = [];
    await axios.get(`https://${domain}/wiki/rest/api/space/${space}/content?depth=root&expand=body.view,children.attachment,history`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(email).toString('base64')}`,
            'Accept': 'application/json'
          }
        }
      )
      .then(async response => {
        if (response && response.data && response.data.page && response.data.page.results) {
          for (let i = 0; i < response.data.page.results.length; i++) {
            const space = response.data.page.results[i];
// console.log(space.children.attachment.results);
            const user: any = await User.findOne({
                $and: [
                  { email: space?.history?.createdBy?.email },
                  { _workspace: workspaceId }
                ]
              }).select('_id').lean();

            const collection = await Collection.create({
              name: space.title,
              _group: groupId,
              _members: [userId],
              _created_by: (user) ? user?._id : userId,
              content: this.htmlToDelta(space?.body?.view?.value),
              created_date: moment().format()
            });

            await this.exportSpaceConfluencePages(domain, space?.id, email, userId, collection?._id, workspaceId, groupId);

            if (space.children && space.children.attachment && space.children.attachment.results) {
              space.children.attachment.results.forEach(async attachment => {
                await this.exportAttachment('collection', attachment, domain, email, workspaceId, groupId, collection?._id, (user) ? user?._id : userId);
              });
            }

            collections.push(collection);
          }
        }
      })
      .catch(err => console.error(err));
    return collections;
  }

  async exportSpaceConfluencePages(domain: string, spaceId: string, email: string, userId: string, collectionId: string, workspaceId: string, groupId: string) {
    // let pages = [];
    await axios.get(`https://${domain}/wiki/rest/api/content/${spaceId}/child/page?expand=children.page,children.attachment,body.view,history,history.contributors,history.lastUpdated,version`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(email).toString('base64')}`,
            'Accept': 'application/json'
          }
        }
      )
      .then(async response => {
        if (response && response.data && response.data.results) {
          for (let i = 0; i < response.data.results.length; i++) {
            const page = response.data.results[i];

            const user: any = await User.findOne({
                $and: [
                  { email: page?.history?.createdBy?.email },
                  { _workspace: workspaceId }
                ]
              }).select('_id').lean();

            const pageData = await Page.create({
              title: page?.title,
              _collection: collectionId,
              _parent: null,
              content: this.htmlToDelta(page?.body?.view?.value),
              _created_by: (user) ? user?._id : userId,
              _updated_by: [userId]
            });

            await this.exportPageConfluenceComments(domain, page?.id, email, pageData?._id, workspaceId, groupId, userId);

            if (page.children && page.children.attachment && page.children.attachment.results) {
              page.children.attachment.results.forEach(async attachment => {
                await this.exportAttachment('page', attachment, domain, email, workspaceId, groupId, pageData?._id, (user) ? user?._id : userId);
              });
            }
          }
        }
      })
      .catch(err => console.error(err));
    // return pages;
  }

  async exportPageConfluenceComments(domain: string, confluenceSpaceId: string, email: string, pageId: string, workspaceId: string, groupId: string, userId: string) {
    // let pages = [];
    await axios.get(`https://${domain}/wiki/rest/api/content/${confluenceSpaceId}/child/comment?expand=children.page,children.attachment,body.view,history`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(email).toString('base64')}`,
            'Accept': 'application/json'
          }
        }
      )
      .then(async response => {
        if (response && response.data && response.data.results) {
          for (let i = 0; i < response.data.results.length; i++) {
            const comment = response.data.results[i];
            const user: any = await User.findOne({
                $and: [
                  { email: comment?.history?.createdBy?.email },
                  { _workspace: workspaceId }
                ]
              }).select('_id').lean();

            // Create comment
            let newComment:any = await Comment.create({
              content: this.htmlToDelta(comment?.body?.view?.value),
              _commented_by: (user) ? user?._id : userId,
              _page: pageId,
              created_date: moment().format()
            });

            if (comment.children && comment.children.attachment && comment.children.attachment.results) {
              comment.children.attachment.results.forEach(async attachment => {
                await this.exportAttachment('comment', attachment, domain, email, workspaceId, groupId, newComment?._id, (user) ? user?._id : userId);
              });
            }
          }
        }
      })
      .catch(err => console.error(err));
    // return pages;
  }

  async exportAttachment(elementType: string, file: any, domain: string, email: string, workspaceId: string, groupId: string, parentId: string, userId: string) {
    const options = {
      headers: {
        'Authorization': `Basic ${Buffer.from(email).toString('base64')}`,
        'Accept': 'application/json'
      },
    };

    const onError = error => {
      console.error(error);
      return;
    };

    const readStream = got.stream(`https://${domain}/wiki${file?._links?.download}`, options);
    readStream.on('response', async response => {
      if (response.headers.age > 3600) {
        console.log('Failure - response too old');
        readStream.destroy(); // Destroy the stream to prevent hanging resources.
        return;
      }

      // Prevent `onError` being called twice.
      readStream.off('error', onError);

      try {
        let fileName = '';
        if (workspaceId) {
          fileName += workspaceId +  '_';
        }

        if (groupId) {
          fileName += groupId +  '_';
        }

        if (parentId) {
          fileName += parentId +  '_';
        }

        fileName += Date.now().toString() + file?.title;

        await minioClient.bucketExists((workspaceId).toLowerCase(), async (error, exists) => {
          if (error) {
            onError(error);
          }

          if (!exists) {
            // Make a bucket.
            await minioClient.makeBucket((workspaceId).toLowerCase(), async (error) => {
              if (error) {
                onError(error);
              }

              const encryption = { algorithm: "AES256" };
              await minioClient.setBucketEncryption((workspaceId).toLowerCase(), encryption)
                .then(() => console.log("Encryption enabled"))
                .catch((error) => console.error(error));

              // Using fPutObject API upload your file to the bucket.
              minioClient.putObject((workspaceId).toLowerCase(), /*folder + */fileName, readStream, (error, objInfo) => {
                if (error) {
                  console.error(error);
                  return;
                }

                this.onFileUploaded(elementType, fileName, file?.title, file.extensions.mediaType, objInfo.etag, objInfo.versionId, groupId, parentId, userId);
              });
            });
          } else {
            // Using fPutObject API upload your file to the bucket.
            minioClient.putObject((workspaceId).toLowerCase(), /*folder + */fileName, readStream, (error, objInfo) => {
              if (error) {
                onError(error);
              }

              this.onFileUploaded(elementType, fileName, file?.title, file.extensions.mediaType, objInfo.etag, objInfo.versionId, groupId, parentId, userId);
            });
          }
        });
      } catch (error) {
        onError(error);
      }
    });

    readStream.once('error', onError);
  }

  async onFileUploaded(elementType: string, fileName: string, filTitle: string, extensionsMediaType: string, file_minio_etag: string, file_minio_versionId: string, groupId: string, parentId: string, userId: string) {
    switch (elementType) {
      case 'collection':
        let collectionFile = await File.create({
          _group: groupId,
          _collection: parentId,
          original_name: filTitle,
          modified_name: fileName,
          minio_etag: file_minio_etag,
          minio_versionId: file_minio_versionId,
          type: 'file',
          mime_type: extensionsMediaType,
          _folder: null,
          _posted_by: userId,
          created_date: DateTime.now()
        });

        await Collection.findByIdAndUpdate({
            _id: parentId
          }, {
            $addToSet: {
              _files: collectionFile._id
            }
          });
        break;
      case 'page':
        let pageFile = await File.create({
          _group: groupId,
          _page: parentId,
          original_name: filTitle,
          modified_name: fileName,
          minio_etag: file_minio_etag,
          minio_versionId: file_minio_versionId,
          type: 'file',
          mime_type: extensionsMediaType,
          _folder: null,
          _posted_by: userId,
          created_date: DateTime.now()
        });

        await Page.findByIdAndUpdate({
            _id: parentId
          }, {
            $addToSet: {
              _files: pageFile._id
            }
          });
        break;
      case 'comment':
        await Comment.findByIdAndUpdate({
            _id: parentId
          }, {
            $addToSet: {
              files: {
                original_name: filTitle,
                modified_name: fileName
              }
            }
          });
        break;
    }
  }

  private htmlToDelta(htmlString: any) {
    return JSON.stringify(convertHtmlToDelta(htmlString));
  }
}
