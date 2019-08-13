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

module.exports = {
    addGroupUploadedFiles,
    getAllFilesFromGroup,
}
