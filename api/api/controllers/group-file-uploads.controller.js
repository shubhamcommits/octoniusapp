const { GroupFilesUpload, Post, DocumentFile} = require('../models');
const { sendErr, sendMail } = require('../../utils');
const mongoose = require('mongoose');
const fs = require('fs');

const getAllFilesFromGroup = async (req, res, next) => {
    try{
         const { groupId,
        } = req.params;

        const filesFromFileSectionUpload = await GroupFilesUpload.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } }
            ]
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');
//workspace check so that we have information for Post/DocumentFile queries
        const filesFromPost = await Post.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } }
            ]
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');

        const filesFromAgora = await DocumentFile.find({
            _group_id: groupId
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id _name created_date _post_id _group_id');

        const concatAllFiles = await Promise.all([filesFromFileSectionUpload, filesFromPost, filesFromAgora])
        .then(res=>{
            const concatfiles = filesFromFileSectionUpload.concat(filesFromAgora,filesFromPost)
            
            concatfiles.sort(function(a,b){
                //get object id for timestamp instead, so we dont need to do different queries
                //newly made will adhere to created date so we can write a mongo shell command 
                //if we want to switch out from doing it from object id timestamps
                const id_a = mongoose.Types.ObjectId(a._id).getTimestamp()
                const id_b = mongoose.Types.ObjectId(b._id).getTimestamp()

                
                return new Date(id_b) - new Date(id_a);
              });

            return concatfiles
          })
        .catch(err=>{
          console.log(err);
        })

        var moreUsersToLoad = false;
        if(concatAllFiles.length >= 11){
            moreUsersToLoad = true
            concatAllFiles.length = 10
        }

        return res.status(200).json({
            message: 'Document File Found!',
            concatAllFiles,
            moreUsersToLoad,
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

const getNextFilesFromGroup = async (req, res, next) => {
    try{
         const { groupId, nextFiles
        } = req.params;

        const filesFromFileSectionUpload = await GroupFilesUpload.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } }
            ]
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');
//workspace check so that we have information for Post/DocumentFile queries
        const filesFromPost = await Post.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } }
            ]
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');

        const filesFromAgora = await DocumentFile.find({
            _group_id: groupId
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id _name created_date _post_id _group_id');

        const concatAllFiles = await Promise.all([filesFromFileSectionUpload, filesFromPost, filesFromAgora])
        .then(res=>{
            const concatfiles = filesFromFileSectionUpload.concat(filesFromAgora,filesFromPost)
            
              const filteredFiles = concatfiles.filter(files => mongoose.Types.ObjectId(files._id).getTimestamp() < mongoose.Types.ObjectId(nextFiles).getTimestamp() )
              
              filteredFiles.sort(function(a,b){
                //get object id for timestamp instead, so we dont need to do different queries
                //newly made will adhere to created date so we can write a mongo shell command 
                //if we want to switch out from doing it from object id timestamps
                const id_a = mongoose.Types.ObjectId(a._id).getTimestamp()
                const id_b = mongoose.Types.ObjectId(b._id).getTimestamp()

                
                return new Date(id_b) - new Date(id_a);
              });

            return filteredFiles
          })
        .catch(err=>{
          console.log(err);
        })

        var moreFilesToLoad = false;
        if(concatAllFiles.length > 5){
            moreFilesToLoad = true
            concatAllFiles.length = 5
        }

        return res.status(200).json({
            message: 'Document File Found!',
            concatAllFiles,
            moreFilesToLoad,
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

const getAllQueryFilesFromGroup = async (req, res, next) => {
    try{
         const { groupId,
            workspaceId
        } = req.params;
        const{ query 
        } = req.body

        const filesFromFileSectionUpload = await GroupFilesUpload.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } },
            {files: {$elemMatch:{ orignal_name: {$regex: query, $options: 'i' }}}}    
            ]
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');
//workspace check so that we have information for Post/DocumentFile queries
        const filesFromPost = await Post.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } },
            {files: {$elemMatch:{ orignal_name: {$regex: query, $options: 'i' }}}}    
        ],
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');

        const filesFromAgora = await DocumentFile.find({
            _group_id: groupId,
            _name:{$regex: query, $options: 'i' }
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id _name created_date _post_id _group_id');

        const concatAllFiles = await Promise.all([filesFromFileSectionUpload, filesFromPost, filesFromAgora])
        .then(res=>{
            const concatfiles = filesFromFileSectionUpload.concat(filesFromAgora,filesFromPost)
            
            concatfiles.sort(function(a,b){
                //get object id for timestamp instead, so we dont need to do different queries
                //newly made will adhere to created date so we can write a mongo shell command 
                //if we want to switch out from doing it from object id timestamps
                const id_a = mongoose.Types.ObjectId(a._id).getTimestamp()
                const id_b = mongoose.Types.ObjectId(b._id).getTimestamp()

                
                return new Date(id_b) - new Date(id_a);
              });

            return concatfiles
          })
        .catch(err=>{
          console.log(err);
        })

        var moreUsersToLoad = false;
        if(concatAllFiles.length >= 11){
            moreUsersToLoad = true
            concatAllFiles.length = 10
        }

        return res.status(200).json({
            message: 'Document File Found!',
            concatAllFiles,
            moreUsersToLoad,
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

const getNextQueryFilesFromGroup = async (req, res, next) => {
    try{
         const { groupId,
            workspaceId
        } = req.params;
        const{ query 
        } = req.body

        const filesFromFileSectionUpload = await GroupFilesUpload.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } },
            { files: {$elemMatch:{ orignal_name: {$regex: query.queryInput, $options: 'i' }}}}    
            ]
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');
//workspace check so that we have information for Post/DocumentFile queries
        const filesFromPost = await Post.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } },
            {files: {$elemMatch:{ orignal_name: {$regex: query.queryInput, $options: 'i' }}}}    
        ],
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');

        const filesFromAgora = await DocumentFile.find({
            _group_id: groupId,
            _name:{$regex: query.queryInput, $options: 'i' }
        }).sort('_id: -1')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id _name created_date _post_id _group_id');

        const concatAllFiles = await Promise.all([filesFromFileSectionUpload, filesFromPost, filesFromAgora])
        .then(res=>{
            const concatfiles = filesFromFileSectionUpload.concat(filesFromAgora,filesFromPost)
            
            const filteredFiles = concatfiles.filter(files => mongoose.Types.ObjectId(files._id).getTimestamp() < mongoose.Types.ObjectId(query.lastMemberQueryID).getTimestamp() )
            
            filteredFiles.sort(function(a,b){
              //get object id for timestamp instead, so we dont need to do different queries
              //newly made will adhere to created date so we can write a mongo shell command 
              //if we want to switch out from doing it from object id timestamps
              const id_a = mongoose.Types.ObjectId(a._id).getTimestamp()
              const id_b = mongoose.Types.ObjectId(b._id).getTimestamp()

              
              return new Date(id_b) - new Date(id_a);
            });

          return filteredFiles
          })
        .catch(err=>{
          console.log(err);
        })

        var moreUsersToLoad = false;
        if(concatAllFiles.length > 5){
            moreUsersToLoad = true
            concatAllFiles.length = 5
        }

        return res.status(200).json({
            message: 'Document File Found!',
            concatAllFiles,
            moreUsersToLoad,
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

const addGroupUploadedFiles = async (req, res, next) => {
    try{
         const { groupId,
            userId,
        } = req.params;

            const uploadFiles = {
                _posted_by : userId,
                files : req.body.files,
                _group: groupId,
            }
            let createGroupFiles = await GroupFilesUpload.create(uploadFiles);
        
            const filesFromFileSectionNewUpload = await GroupFilesUpload.findOne({
                $and: [
                { _id: createGroupFiles._id},
                { _group: groupId } ,
                { files: { $exists: true, $ne: [] } }
                ]
            }).sort('_id: -1')
            .populate('_posted_by', 'first_name last_name profile_pic')
            .select('_posted_by _id files created_date');

        return res.status(200).json({
            message: 'Added File To Group!',
            filesFromFileSectionNewUpload
          });

    }   catch(err){
        return sendErr(res, err);
    }
}
const deleteGroupFiles = async (req, res, next) => {
    try{
         const { groupId,
            userId,
            filePostType,
        } = req.params;

        switch (filePostType) {
            case 'group_file':
                const checkFileInGroup = await GroupFilesUpload.findOne({ _id: req.body.allFileInfo._id })
                const checkFileInPost = await Post.findOne({ _id: req.body.allFileInfo._id })

                function deleteFiles(files, callback){
                    var i = files.length;
                    files.forEach(function(filepath){
                      const finalpath =`${process.env.FILE_UPLOAD_FOLDER}${filepath.modified_name}`
                      fs.unlink(finalpath, function(err) {
                        i--;
                        if (err) {
                          callback(err);
                          return;
                        } else if (i <= 0) {
                          callback(null);
                        }
                      });
                    });
                  }
                  deleteFiles([req.body.fileToDeleteGroup], function(err) {
                    if (err) {
                        //file is not there for some reason? deleted previously or is just not there from the link
                        if (err.code == 'ENOENT' && err.syscall == 'unlink'){
                        }else{
                        //error when deleting
                            return sendErr(res, err)
                        }
                    }
                  });

                if(checkFileInGroup){
                    //files came from group file selection delete values there later
                    const deletedGroupFile =  await GroupFilesUpload.findByIdAndUpdate({ 
                        _id: new mongoose.Types.ObjectId(req.body.allFileInfo._id) },
                        { $pull: { files : { _id : {$in : [req.body.fileToDeleteGroup].map(e => new mongoose.Types.ObjectId(e._id))} } } }
                        )
                    //here we delete group upload files
                    const emptyGroupFile =  await GroupFilesUpload.findById({ 
                        _id: new mongoose.Types.ObjectId(req.body.allFileInfo._id)})
                    if(emptyGroupFile.files.length === 0){
                        const deleteEmptyGroupFile =  await GroupFilesUpload.findByIdAndDelete({ 
                            _id: new mongoose.Types.ObjectId(req.body.allFileInfo._id)})
                    }

                }else if (checkFileInPost){
                    //files from post but dont delete the whole post 
                    const deletedFileInPost =  await Post.findByIdAndUpdate({ 
                        _id: new mongoose.Types.ObjectId(req.body.allFileInfo._id) },
                        { $pull: { files : { _id : {$in : req.body.allFileInfo.files.map(e => new mongoose.Types.ObjectId(e._id))} } } }
                        )
                }
                break;
            case 'agora_file':
                    const deletedAgoraGroupFile =  await DocumentFile.findOneAndRemove({ _id: req.body.allFileInfo._id })
                break
            default:
                break;
        }

        return res.status(200).json({
            message: 'Deleted Files!',
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

module.exports = {
    addGroupUploadedFiles,
    getAllFilesFromGroup,
    getNextFilesFromGroup,
    getAllQueryFilesFromGroup,
    getNextQueryFilesFromGroup,
    deleteGroupFiles,
}
