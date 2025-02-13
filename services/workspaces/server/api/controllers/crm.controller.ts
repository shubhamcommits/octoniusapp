import { Company, Contact, Product, User, Workspace } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { DateTime } from 'luxon';
import { ObjectID } from "mongodb";

/*  ===================
 *  -- CRM METHODS --
 *  ===================
 * */

export class CRMController {
    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async getCRMInfo(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const contacts = await Contact.find({
                _workspace: workspaceId,
            })
                .sort("name")
                .populate("_company", "_id name description company_pic")
                .lean();

            const workspace = await Workspace.findOne({
                _id: workspaceId,
            })
                .select("crm_custom_fields")
                .lean();

            const companies = await Company.find({
                _workspace: workspaceId,
            })
                .sort("name")
                .lean();

            const products = await Product.find({
                _workspace: workspaceId,
            })
                .sort("name")
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "CRM Info found!",
                contacts: contacts,
                companies: companies,
                products: products,
                crm_custom_fields: workspace.crm_custom_fields,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async getCRMContacts(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const contacts = await Contact.find({
                _workspace: workspaceId,
            })
                .sort("name")
                .populate("_company", "_id name description company_pic")
                .lean();

            if (!contacts) {
                return sendError(
                    res,
                    new Error("Oops, contacts not found!"),
                    "Contacts not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Contacts found!",
                contacts: contacts,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async searchCRMContacts(req: Request, res: Response) {
        try {
            const { companyId } = req.params;

            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            let contacts;
            if (!!companyId && companyId != "undefined") {
                contacts = await Contact.find({
                    $and: [
                        { _workspace: workspaceId },
                        {
                            name: {
                                $regex: req.query.companySearchText,
                                $options: "i",
                            },
                        },
                        { _company: companyId },
                        // { company_history : { $elemMatch: { _company: companyId }}}
                    ],
                })
                    .sort("name")
                    .populate("_company", "_id name description company_pic")
                    .lean();
            } else {
                contacts = await Contact.find({
                    $and: [
                        { _workspace: workspaceId },
                        {
                            name: {
                                $regex: req.query.companySearchText,
                                $options: "i",
                            },
                        },
                    ],
                })
                    .sort("name")
                    .populate("_company", "_id name description company_pic")
                    .lean();
            }

            if (!contacts) {
                return sendError(
                    res,
                    new Error("Oops, contacts not found!"),
                    "Contacts not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Contacts found!",
                contacts: contacts,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches a crm contact corresponding to the @constant contactId
     * @param req - @constant contactId
     */
    async getCRMContact(req: Request, res: Response) {
        try {
            const contact = await Contact.findOne({
                _id: req.params.contactId,
            })
                .populate("_company", "_id name description company_pic")
                .lean();

            if (!contact) {
                return sendError(
                    res,
                    new Error("Oops, contact not found!"),
                    "Contact not found, Invalid contactId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Contact found!",
                contact: contact,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function removes a crm contact
     * @param req - @constant contactId
     */
    async removeCRMContact(req: Request, res: Response, next: NextFunction) {
        try {
            const contactId = req.params.contactId;

            const contact = await Contact.findOneAndDelete({
                _id: contactId,
            }).lean();

            return res.status(200).json({
                message: "Contact deleted successfully!",
                contact: contact,
            });
        } catch (error) {
            return sendError(res, error, "Internal Server Error!", 500);
        }
    }

    /**
     * This function updates a crm contact
     * @param req - @constant contactData
     */
    async updateCRMContact(req: Request, res: Response) {
        try {
            const { contactId } = req.params;
            const { contactData } = req.body;

            const contact = await Contact.findOneAndUpdate(
                {
                    _id: contactId,
                },
                {
                    $set: {
                        name: contactData?.name,
                        description: contactData?.description,
                        phones: contactData?.phones,
                        emails: contactData?.emails,
                        links: contactData?.links,
                        _company: contactData?._company,
                        position: contactData?.position,
                        crm_custom_fields: contactData?.crm_custom_fields,
                    },
                },
                {
                    new: true,
                }
            )
                .sort("name")
                .populate("_company", "_id name description company_pic")
                .lean();

            if (!contact) {
                return sendError(
                    res,
                    new Error("Oops, contact not found!"),
                    "Contact not found, Invalid contactId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Contact updated!",
                contact: contact,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function creates a crm contact
     * @param req - @constant contactData
     */
    async createCRMContact(req: Request, res: Response) {
        try {
            const { contactData } = req.body;

            let contact = await Contact.create(contactData);

            if (!contact) {
                return sendError(
                    res,
                    new Error("Oops, contact not created!"),
                    "Contact not found, Invalid contact data!",
                    404
                );
            }

            contact = await Contact.findOne({
                _id: contact._id,
            })
                .populate("_company", "_id name description company_pic")
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Contact created!",
                contact: contact,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches a crm contact corresponding to the @constant contactId
     * @param req - @constant contactId
     */
    async getCRMCompany(req: Request, res: Response) {
        try {
            const company = await Company.findOne({
                _id: req.params.companyId,
            })
                .populate({
                    path: "tasks._assigned_to",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "tasks._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "updates._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .lean();

            if (!company) {
                return sendError(
                    res,
                    new Error("Oops, company not found!"),
                    "Company not found, Invalid companyId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Company found!",
                company: company,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async getCRMCompanies(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const companies = await Company.find({
                _workspace: workspaceId,
            })
                .sort("name")
                .lean();

            if (!companies) {
                return sendError(
                    res,
                    new Error("Oops, companies not found!"),
                    "Companies not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Companies found!",
                companies: companies,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async searchCRMCompanies(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const companies = await Company.find({
                $and: [
                    { _workspace: workspaceId },
                    {
                        name: {
                            $regex: req.query.companySearchText,
                            $options: "i",
                        },
                    },
                ],
            })
                .sort("name")
                .lean();

            if (!companies) {
                return sendError(
                    res,
                    new Error("Oops, companies not found!"),
                    "Companies not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Companies found!",
                companies: companies,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function updates a crm company
     * @param req - @constant companyData
     */
    async updateCRMCompany(req: Request, res: Response) {
        try {
            const { companyId } = req.params;
            const { companyData } = req.body;

            let company = await Company.findOneAndUpdate(
                {
                    _id: companyId,
                },
                {
                    $set: {
                        name: companyData?.name,
                        description: companyData?.description,
                        crm_custom_fields: companyData?.crm_custom_fields,
                    },
                },
                {
                    new: true,
                }
            )
                .populate({
                    path: "tasks._assigned_to",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "tasks._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "updates._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .sort("name")
                .lean();

            // Check if workspace already exist with the same workspaceId
            if (!company) {
                return sendError(
                    res,
                    new Error("Oops, company not found!"),
                    "Company not found, Invalid companyId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Company updated!",
                company: company,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function creates a crm company
     * @param req - @constant companyData
     */
    async createCRMCompany(req: Request, res: Response) {
        try {
            const { companyData } = req.body;

            let company = await Company.create(companyData);

            if (!company) {
                return sendError(
                    res,
                    new Error("Oops, company not created!"),
                    "Company not found, Invalid company data!",
                    404
                );
            }

            company = await Company.findOne({
                _id: company._id,
            })
                .populate({
                    path: "tasks._assigned_to",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "tasks._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "updates._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Company created!",
                company: company,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function removes a crm company
     * @param req - @constant companyId
     */
    async removeCRMCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.params.companyId;

            const company = await Company.findOneAndDelete({
                _id: companyId,
            }).lean();

            return res.status(200).json({
                message: "Company deleted successfully!",
                company: company,
            });
        } catch (error) {
            return sendError(res, error, "Internal Server Error!", 500);
        }
    }

    /**
     * This function fetches a crm contact corresponding to the @constant contactId
     * @param req - @constant contactId
     */
    async getCRMProduct(req: Request, res: Response) {
        try {
            const product = await Product.findOne({
                _id: req.params.productId,
            }).lean();

            if (!product) {
                return sendError(
                    res,
                    new Error("Oops, product not found!"),
                    "Product not found, Invalid productId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Product found!",
                product: product,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches all the crm products of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async getCRMProducts(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const products = await Product.find({
                _workspace: workspaceId,
            })
                .sort("name")
                .lean();

            if (!products) {
                return sendError(
                    res,
                    new Error("Oops, products not found!"),
                    "Products not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Products found!",
                products: products,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async searchCRMProducts(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const products = await Product.find({
                $and: [
                    { _workspace: workspaceId },
                    {
                        name: {
                            $regex: req.query.productSearchText,
                            $options: "i",
                        },
                    },
                ],
            })
                .sort("name")
                .lean();

            if (!products) {
                return sendError(
                    res,
                    new Error("Oops, products not found!"),
                    "Products not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Products found!",
                products: products,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function updates a crm product
     * @param req - @constant companyData
     */
    async updateCRMProduct(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { productData } = req.body;

            let product = await Product.findOneAndUpdate(
                {
                    _id: productId,
                },
                {
                    $set: {
                        name: productData?.name,
                        description: productData?.description,
                        crm_custom_fields: productData?.crm_custom_fields,
                    },
                },
                {
                    new: true,
                }
            )
                .sort("name")
                .lean();

            // Check if workspace already exist with the same workspaceId
            if (!product) {
                return sendError(
                    res,
                    new Error("Oops, product not found!"),
                    "Product not found, Invalid companyId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Product updated!",
                product: product,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function creates a crm product
     * @param req - @constant productData
     */
    async createCRMProduct(req: Request, res: Response) {
        try {
            const { productData } = req.body;

            let product = await Product.create(productData);

            if (!product) {
                return sendError(
                    res,
                    new Error("Oops, product not created!"),
                    "Product not found, Invalid product data!",
                    404
                );
            }

            product = await Product.findOne({
                _id: product._id,
            }).lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Product created!",
                product: product,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function removes a crm product
     * @param req - @constant productId
     */
    async removeCRMProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const productId = req.params.productId;

            const product = await Product.findOneAndDelete({
                _id: productId,
            }).lean();

            return res.status(200).json({
                message: "Product deleted successfully!",
                product: product,
            });
        } catch (error) {
            return sendError(res, error, "Internal Server Error!", 500);
        }
    }

    /**
     * This function is responsible for adding a new crm custom field for the particular workspace
     * @param { customFiel } req
     * @param res
     */
    async addCRMCustomField(req: Request, res: Response, next: NextFunction) {
        // Fetch the newCustomField from fileHandler middleware
        const newCustomField = req.body["newCustomField"];

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            // Find the workspace and update their respective workspace avatar
            const workspace = await Workspace.findByIdAndUpdate(
                {
                    _id: workspaceId,
                },
                {
                    //custom_fields: newCustomField
                    $push: { crm_custom_fields: newCustomField },
                },
                {
                    new: true,
                }
            ).select("crm_custom_fields");

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace crm custom fields added!",
                crm_custom_fields: workspace.crm_custom_fields,
            });
        } catch (err) {
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    /**
     * This function fetches all the crm contacts of a workspace corresponding to the @constant workspaceId
     * @param req - @constant workspaceId
     */
    async getCRMCustomFields(req: Request, res: Response) {
        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            // Find the Workspace based on the workspaceId
            const workspace = await Workspace.findOne({
                _id: workspaceId,
            })
                .select("crm_custom_fields")
                .lean();

            // Check if workspace already exist with the same workspaceId
            if (!workspace) {
                return sendError(
                    res,
                    new Error("Oops, workspace not found!"),
                    "Workspace not found, Invalid workspaceId!",
                    404
                );
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "Workspace found!",
                crm_custom_fields: workspace.crm_custom_fields,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async removeCRMCustomField(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Fetch the workspaceId & fieldId
        const { fieldId } = req.params;

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            let workspace = await Workspace.findById({
                _id: workspaceId,
            })
                .select("crm_custom_fields")
                .lean();

            const cfIndex = workspace.crm_custom_fields.findIndex(
                (cf) => cf._id == fieldId
            );
            const cf =
                workspace && workspace.crm_custom_fields
                    ? workspace.crm_custom_fields[cfIndex]
                    : null;

            if (!!cf) {
                // remove the CF from the table widget
                workspace = await Workspace.findByIdAndUpdate(
                    {
                        _id: workspaceId,
                    },
                    {
                        $pull: {
                            "crm_custom_fields_table_widget.selectTypeCFs":
                                cf.name,
                            "crm_custom_fields_table_widget.inputTypeCFs":
                                cf.name,
                        },
                    }
                ).lean();
            }

            // Find the workspace and update their respective workspace avatar
            workspace = await Workspace.findByIdAndUpdate(
                {
                    _id: workspaceId,
                },
                {
                    $pull: {
                        crm_custom_fields: {
                            _id: fieldId,
                        },
                    },
                }
            ).lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace crm custom fields updated!",
                workspace: workspace,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async addCRMCustomFieldValue(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body["fieldId"];
        const value = req.body["value"];

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            // Find the custom field in a workspace and add the value
            const workspace = await Workspace.findByIdAndUpdate(
                {
                    _id: workspaceId,
                },
                {
                    $push: { "crm_custom_fields.$[field].values": value },
                },
                {
                    arrayFilters: [{ "field._id": fieldId }],
                    new: true,
                }
            )
                .select("crm_custom_fields")
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace custom fields updated!",
                workspace: workspace,
            });
        } catch (err) {
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async setCRMCustomFieldType(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body["fieldId"];
        const type = req.body["type"];

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            // Find the custom field in a workspace and add the value
            const workspace = await Workspace.findByIdAndUpdate(
                {
                    _id: workspaceId,
                },
                {
                    $set: { "crm_custom_fields.$[field].type": type },
                },
                {
                    arrayFilters: [{ "field._id": fieldId }],
                    new: true,
                }
            )
                .select("crm_custom_fields")
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace crm custom fields updated!",
                workspace: workspace,
            });
        } catch (err) {
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async setCRMCustomFieldColor(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body["fieldId"];
        const color = req.body["color"];

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            // Find the custom field in a workspace and add the value
            const workspace = await Workspace.findByIdAndUpdate(
                {
                    _id: workspaceId,
                },
                {
                    $set: { "crm_custom_fields.$[field].badge_color": color },
                },
                {
                    arrayFilters: [{ "field._id": fieldId }],
                    new: true,
                }
            )
                .select("crm_custom_fields")
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace crm custom fields updated!",
                workspace: workspace,
            });
        } catch (err) {
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async removeCRMCustomFieldValue(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Find the custom field in a workspace and remove the value
        const fieldId = req.body["fieldId"];
        const value = req.body["value"];

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            const workspace = await Workspace.findByIdAndUpdate(
                {
                    _id: workspaceId,
                },
                {
                    $pull: { "crm_custom_fields.$[field].values": value },
                },
                {
                    arrayFilters: [{ "field._id": fieldId }],
                    new: true,
                }
            ).select("crm_custom_fields");

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace crm custom fields updated!",
                workspace: workspace,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    /**
     * This function is responsible for updating the custom fields to show in the list view for the particular workspace
     * @param { column } req
     * @param res
     */
    async updateCRMCustomFieldsToShow(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Fetch the fileName from fileHandler middleware
        const customFieldsData = req.body;

        try {
            const userId = req["userId"];

            const user = await User.findOne({ _id: userId })
                .select("_workspace")
                .lean();
            const workspaceId = user._workspace._id || user._workspace;

            // Find the workspace and update their respective workspace avatar
            const workspace = await Workspace.updateOne(
                {
                    _id: workspaceId,
                },
                {
                    $set: {
                        crm_custom_fields_to_show:
                            customFieldsData.crmCustomFieldsToShow,
                    },
                },
                {
                    new: true,
                }
            ).select("crm_custom_fields_to_show");

            // Send status 200 response
            return res.status(200).json({
                message: "Workspace crm custom fields to show updated!",
                workspace: workspace,
            });
        } catch (err) {
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async addCRMCompanyTask(req: Request, res: Response, next: NextFunction) {
        // Find the custom field in a workspace and remove the value
        const companyId = req.body["companyId"];
        const taskData = req.body["taskData"];
        taskData._created_user = req["userId"];
        try {
            let company = await Company.findByIdAndUpdate(
                {
                    _id: companyId,
                },
                {
                    $push: { tasks: taskData },
                }
            );

            company = await Company.findById({
                _id: companyId,
            })
                .populate({
                    path: "tasks._assigned_to",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "tasks._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "updates._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Company crm task added!",
                company: company,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async updateCRMCompanyTask(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Find the custom field in a workspace and remove the value
        const companyId = req.body["companyId"];
        const taskData = req.body["taskData"];

        try {
            let company = await Company.findById({
                _id: companyId,
            })
                .select("tasks")
                .lean();
            const taskIndex = company?.tasks?.findIndex(
                (task) => task._id == taskData._id
            );

            if (taskIndex >= 0) {
                company.tasks[taskIndex] = taskData;
                company = await Company.findByIdAndUpdate(
                    {
                        _id: companyId,
                    },
                    {
                        $set: { tasks: company.tasks },
                    }
                )
                    .populate({
                        path: "tasks._assigned_to",
                        select: "_id first_name last_name profile_pic",
                    })
                    .populate({
                        path: "tasks._created_user",
                        select: "_id first_name last_name profile_pic",
                    })
                    .populate({
                        path: "updates._created_user",
                        select: "_id first_name last_name profile_pic",
                    })
                    .lean();
            }

            // Send status 200 response
            return res.status(200).json({
                message: "Company crm task updated!",
                company: company,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async removeCRMCompanyTask(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Find the custom field in a workspace and remove the value
        const companyId = req.body["companyId"];
        const taskId = req.body["taskId"];

        try {
            const company = await Company.findByIdAndUpdate(
                {
                    _id: companyId,
                },
                {
                    $pull: {
                        tasks: {
                            _id: taskId,
                        },
                    },
                }
            ).lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Company crm task deleted!",
                company: company,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async addCRMCompanyUpdate(req: Request, res: Response, next: NextFunction) {
        // Find the custom field in a workspace and remove the value
        const companyId = req.body["companyId"];
        const updateData = req.body["updateData"];
        updateData._created_user = req["userId"];
        try {
            let company = await Company.findByIdAndUpdate(
                {
                    _id: companyId,
                },
                {
                    $push: { updates: updateData },
                }
            );

            company = await Company.findById({
                _id: companyId,
            })
                .populate({
                    path: "tasks._assigned_to",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "tasks._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .populate({
                    path: "updates._created_user",
                    select: "_id first_name last_name profile_pic",
                })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Company crm update added!",
                company: company,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async updateCRMCompanyUpdate(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Find the custom field in a workspace and remove the value
        const companyId = req.body["companyId"];
        const updateData = req.body["updateData"];

        try {
            let company = await Company.findById({
                _id: companyId,
            })
                .select("updates")
                .lean();
            const updateIndex = company?.updates?.findIndex(
                (update) => update._id == updateData._id
            );

            if (updateIndex >= 0) {
                company.updates[updateIndex] = updateData;
                company = await Company.findByIdAndUpdate(
                    {
                        _id: companyId,
                    },
                    {
                        $set: { updates: company.updates },
                    }
                )
                    .populate({
                        path: "tasks._assigned_to",
                        select: "_id first_name last_name profile_pic",
                    })
                    .populate({
                        path: "tasks._created_user",
                        select: "_id first_name last_name profile_pic",
                    })
                    .populate({
                        path: "updates._created_user",
                        select: "_id first_name last_name profile_pic",
                    })
                    .lean();
            }

            // Send status 200 response
            return res.status(200).json({
                message: "Company crm update updated!",
                company: company,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async removeCRMCompanyUpdate(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Find the custom field in a workspace and remove the value
        const companyId = req.body["companyId"];
        const updateId = req.body["updateId"];

        try {
            const company = await Company.findByIdAndUpdate(
                {
                    _id: companyId,
                },
                {
                    $pull: {
                        updates: {
                            _id: updateId,
                        },
                    },
                }
            ).lean();

            // Send status 200 response
            return res.status(200).json({
                message: "Company crm update deleted!",
                company: company,
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
        }
    }

    async getCRMCompanyDueTasks(
        req: Request,
        res: Response
    ) {
        const userId = req["userId"];

        try {
            // Get the current time in UTC
            const now = DateTime.now();
            
            // Define time ranges using Luxon
            const todayStart = now.startOf("day").toJSDate();

            const tasks = await Company.aggregate([
              { $unwind: "$tasks" }, // Expand the tasks array
              {
                $match: {
                    "tasks._assigned_to": {
                        $elemMatch: {
                          $eq: new ObjectID(userId)
                        }
                    }
                }
              },
              {
                $match: {
                  $or: [
                    { "tasks.date": { $lt: todayStart } }, // Overdue tasks
                  ]
                }
              },
              {
                $project: {
                  _id: 0,
                  company_name: "$name",
                  task_description: "$tasks.description",
                }
              },            
            ]);
             
            return res.status(200).json({
                message: 'Company tasks found!',
                crm_due_tasks: tasks
            });       
          } catch (err) {
            console.log(err);
            return sendError(res, err, "Internal Server Error!", 500);
          }
        };        

    // async migrateCRMFromGroupToGlobal(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         let stream = Readable.from(await Group.find({
    //                 type: 'crm'
    //             }).select('_workspace crm_custom_fields crm_custom_fields_to_show').lean());

    //         await stream.on('data', async (group: any) => {
    //             const workspaceId = group._workspace;
    //             await Contact.updateMany({
    //                     _group: group._id
    //                 }, {
    //                     $set: { _workspace: workspaceId }
    //                 });

    //             await Company.updateMany({
    //                     _group: group._id
    //                 }, {
    //                     $set: { _workspace: workspaceId }
    //                 });

    //             await Product.updateMany({
    //                     _group: group._id
    //                 }, {
    //                     $set: { _workspace: workspaceId }
    //                 });

    //             let workspace = await Workspace.findById(workspaceId).select('crm_custom_fields crm_custom_fields_to_show').lean()
    //             if (!!group.crm_custom_fields) {
    //                 group.crm_custom_fields?.forEach(async cf => {
    //                     const index = (!!workspace.crm_custom_fields) ? workspace.crm_custom_fields.findIndex(crmcf => crmcf.name == cf.name) : -1;
    //                     if (index < 0) {
    //                         workspace = await Workspace.findOneAndUpdate({
    //                             _id: workspaceId
    //                         }, {
    //                             $addToSet: {
    //                                 crm_custom_fields: cf
    //                             }
    //                         }).select('crm_custom_fields crm_custom_fields_to_show').lean();
    //                     }
    //                 });
    //             }

    //             if (!!group.crm_custom_fields_to_show) {
    //                 group.crm_custom_fields_to_show?.forEach(async cf => {
    //                     const index = (!!workspace.crm_custom_fields_to_show) ? workspace.crm_custom_fields_to_show.findIndex(crmcfts => {
    //                         return crmcfts == cf}) : -1;
    //                     if (index < 0) {
    //                         workspace = await Workspace.findOneAndUpdate({
    //                             _id: workspaceId
    //                         }, {
    //                             $addToSet: {
    //                                 crm_custom_fields_to_show: cf
    //                             }
    //                         }).select('crm_custom_fields crm_custom_fields_to_show').lean();
    //                     }
    //                 });
    //             }

    //             group = await Group.findOneAndUpdate({
    //                     _id: group._id
    //                 }, {
    //                     $set: {
    //                         dialog_properties_to_show: {
    //                             task: ['status', 'date', 'assignee', 'tags', 'custom_fields', 'actions', 'approvals', 'shuttle_task', 'parent_task'],
    //                             northStar: ['north_star', 'shuttle_task', 'date', 'assignee', 'tags', 'custom_fields', 'actions', 'approvals'],
    //                             CRMOrder: ['crm_setup', 'status', 'date', 'assignee', 'custom_fields'],
    //                             CRMLead: ['crm_setup', 'status', 'date', 'assignee', 'tags', 'custom_fields']
    //                         }
    //                     }
    //                 }).lean()
    //         });

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'CRM Migrated!'
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };
}
