const Template = require('./../models/template.model');

class TemplateController {

   async getAll(req, res) {
       console.log('bodyyyyyyyyyyyyyyyyyy', req.body);
       console.log('paramssssssssssssssss', req.params);
        return res.status(200).json(
            await Template.find({
                groupId: req.params.groupId
            })
        );
    };

   async create(req, res) {
       console.log('bodyyyyyyyyyyyyyyyyyy', req.body);
       console.log('paramssssssssssssssss', req.params);
       try {

           res.status(200).json(
               await Template.create({
                   title: req.body.title,
                   description: req.body.description,
                   userId: req.body.userId,
                   groupId: req.body.groupId,
                   content: JSON.stringify(req.body.content)
               })
           );
       } catch (e) {
           console.log(e);
           res.status(500).json({
               error: 'Template failed to save'
           });
       }
   }

   async delete(req, res) {
       console.log('idddd', req.params.templateId);
       try {
           await Template.deleteOne({_id: req.params.templateId});
           res.status(200).json({
               message: 'successfully deleted'
           })
       } catch (e) {
           console.log('errrorrrrrrrrrrrrrrr', e);
           res.status(500).json({
               e
           })
       }
   }

}

module.exports = new TemplateController();
