const { GroupFilesUpload, Post, DocumentFile} = require('../models');
const { sendErr, sendMail } = require('../../utils');
const mongoose = require('mongoose');

const getAllFilesFromGroup = async (req, res, next) => {
    try{
         const { groupId,
        } = req.params;

        const filesFromFileSectionUpload = await GroupFilesUpload.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } }
            ]
        }).sort('-created_date')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');
//workspace check so that we have information for Post/DocumentFile queries
        const filesFromPost = await Post.find({
            $and: [
            { _group: groupId } ,
            { files: { $exists: true, $ne: [] } }
            ]
        }).sort('-created_date')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id files created_date');

        const filesFromAgora = await DocumentFile.find({
            _group_id: groupId
        }).sort('-created_date')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .select('_posted_by _id _name created_date');


        const concatAllFiles = await Promise.all([filesFromFileSectionUpload, filesFromPost, filesFromAgora])
        .then(res=>{
            const concatfiles = filesFromFileSectionUpload.concat(filesFromAgora,filesFromPost)
            
            concatfiles.sort(function(a,b){
                return new Date(b.created_date) - new Date(a.created_date);
              });

            return concatfiles
          })
        .catch(err=>{
          console.log(err);
        })


        return res.status(200).json({
            message: 'Document File Found!',
            concatAllFiles,
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

        if (req.body.files.length > 0){
            //let post = await GroupFileUpload.create(postData);
            const uploadFiles = {
                _posted_by : userId,
                files : req.body.files,
                _group: groupId,
            }
            let createGroupFiles = await GroupFilesUpload.create(uploadFiles);
        }

        return res.status(200).json({
            message: 'Document File Found!',
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

module.exports = {
    addGroupUploadedFiles,
    getAllFilesFromGroup,
}
