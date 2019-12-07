const Template = require('./../models/template.model');

class TemplateController {
    getAll(req, res) {
        return res.status(200).json({
            templates: Template.findWhere({
                groupId: req.params.groupId
            })
        });
    };

}

module.exports = new TemplateController();
