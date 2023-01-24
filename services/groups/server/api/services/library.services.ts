import { Page, File, Collection } from "../models";
import { Readable } from 'stream';

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

    const finalpath = `${collection.collection_avatar}`
    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    await minioClient.removeObject(workspaceId, finalpath, (error) => {
      if (error) {
        throw (error);
      }
    });

    await Page.deleteMany({ _collection: collectionId });

    this.deleteCollectionFiles(workspaceId, collectionId);
  }

  async updateCollectionImage(collectionId: string, workspaceId: string, fileName: string) {

    let collection = await Collection.findById({
          _id: collectionId
      }).select('collection_avatar').lean();

    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });
    
    // Remove previuos image
    const finalpath = `${collection.collection_avatar}`
    await minioClient.removeObject(workspaceId, finalpath, (error) => {});
    
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

    const finalpath = `${file.modified_name}`
    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

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

    await Page.findByIdAndRemove({
        _id: pageId
    });
  };

  async deleteCollectionFiles(workspaceId: string, collectionId: string) {

    const files = await File.find({ _collection: collectionId }).lean();

    files.forEach(async (filepath) => {
      const finalpath = `${filepath.modified_name}`
      var minioClient = new minio.Client({
        endPoint: process.env.MINIO_DOMAIN,
        port: +(process.env.MINIO_API_PORT),
        useSSL: process.env.MINIO_PROTOCOL == 'https',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
      });

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
      const finalpath = `${filepath.modified_name}`
      var minioClient = new minio.Client({
        endPoint: process.env.MINIO_DOMAIN,
        port: +(process.env.MINIO_API_PORT),
        useSSL: process.env.MINIO_PROTOCOL == 'https',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
      });

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

    const finalpath = `${file.modified_name}`
    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

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
}
