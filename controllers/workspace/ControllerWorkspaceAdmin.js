const Wrokspace = require("../../models/workspace")

module.exports = {


    updateAllowedEmailDomains(req, res, next) {
        let workspace_id = req.params.workspaceId;
        let allowed_domains = req.body.domains.split(',');

        Wrokspace.findByIdAndUpdate({
                _id: workspace_id
            }, {
                $push: {
                    allowed_domains: allowed_domains
                }
            }, {
                new: true
            })
            .then((workspace) => {

                if (workspace == null) {
                    res.status(404).json({
                        message: "Invalid workspace id error,workspace not found.",
                    });
                } else {
                    res.status(200).json({
                        message: "Domains data have Updated successfully",
                        workspace
                    })
                }
            })
            .catch((error) => {

                res.status(500).json({
                    message: "something went wrong | internal server error",
                    error
                })

            })

    }

}