const { DocumentFile } = require('../models');
const { sendErr, sendMail } = require('../../utils');
const mongoose = require('mongoose');


const getFile = async (req, res, next) => {
    try{
        const { postId } = req.params;

        const file = await DocumentFile.find({
            _post_id: postId
        });

        return res.status(200).json({
            message: 'Document File Found!',
            file
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

const getGroupFiles = async (req, res, next) => {
    try{
        const { groupId } = req.params;

        const file = await DocumentFile.find({
            _group_id: groupId
        });

        return res.status(200).json({
            message: 'Group document files Found!',
            file
          });

    }   catch(err) {
        return sendErr(res, err);
    }
}

const createFile = async (req, res, next) => {
    try{
        const {
            //params: fileId,
            body:{ _content, _name, _post_id, _group_id }
        } = req;

        const fileData = {
            _post_id: _post_id,
            _name: _name,
            _content: _content,
            _group_id: _group_id
        }

        const file = await DocumentFile.create(fileData);

        return res.status(200).json({
            message: 'Document File Created!',
            file
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

const updateFile = async (req, res, next) => {
    try{
        const {
            params: { postId },
            body: { _content, _name, _group_id }
        } = req;

        const fileData = {
            //_post_id: _post_id,
            _name: _name,
            _content: _content,
            _group_id: _group_id
        }

        // const file = await DocumentFile.findOneAndUpdate({
        //     _post_id: postId,
        //     $set: fileData,
        // })
        const file = await DocumentFile.findOneAndUpdate({_post_id: postId},{$set: fileData})

        return res.status(200).json({
            message: 'Document File updated!',
            file
          });

    }   catch(err){
        return sendErr(res, err);
    }
}

/***
 * Jessie Jia Edit
 */
const deleteFile = async (req, res, next) => {
    try{
        const { postId } = req.params;

        const file = await DocumentFile.findOneAndDelete({
            _post_id: postId
        });

        return res.status(200).json({
            message: 'Document File Deleted!'
        });

    }   catch(err){
        return sendErr(res, err);
    }
}

module.exports = {
    getFile,
    createFile,
    deleteFile,
    updateFile,
    getGroupFiles,
}
