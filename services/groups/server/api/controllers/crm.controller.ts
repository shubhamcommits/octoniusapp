import { Column, Company, Contact, Flow, Group, Post, Product } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';

/*  ===================
 *  -- CRM METHODS --
 *  ===================
 * */

export class CRMController {

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async getGroupCRMInfo(req: Request, res: Response) {
    //     try {
    //         const { groupId } = req.params;

    //         const contacts = await Contact.find({
    //                 _group: groupId
    //             })
    //             .sort('name')
    //             .populate('_company', '_id name description company_pic')
    //             .lean();

    //         const group = await Group.findOne({
    //                 _id: groupId
    //             }).select('crm_custom_fields').lean();

    //         const companies = await Company.find({
    //                 _group: req.params.groupId
    //             })
    //             .sort('name')
    //             .lean();

    //         const products = await Product.find({
    //                 _group: req.params.groupId
    //             })
    //             .sort('name')
    //             .lean();
            
    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Contacts found!',
    //             contacts: contacts,
    //             companies: companies,
    //             products: products,
    //             crm_custom_fields: group.crm_custom_fields
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async getGroupCRMContacts(req: Request, res: Response) {
    //     try {
    //         const contacts = await Contact.find({
    //                 _group: req.params.groupId
    //             })
    //             .sort('name')
    //             .populate('_company', '_id name description company_pic')
    //             .lean();

    //         if (!contacts) {
    //             return sendError(res, new Error('Oops, contacts not found!'), 'Contacts not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Contacts found!',
    //             contacts: contacts
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async searchGroupCRMContacts(req: Request, res: Response) {
    //     try {
    //         const { groupId, companyId } = req.params;

    //         let contacts;
    //         if (!!companyId && companyId != 'undefined') {
    //             contacts = await Contact.find({
    //                     $and: [
    //                         { _group: groupId },
    //                         { name: { $regex: req.query.companySearchText, $options: 'i' } },
    //                         { _company: companyId }
    //                         // { company_history : { $elemMatch: { _company: companyId }}}
    //                     ]
    //                 })
    //                 .sort('name')
    //                 .populate('_company', '_id name description company_pic')
    //                 .lean();

    //             // await User.updateMany({ _groups: groupId }, {
    //             //         $pull: { 'stats.favorite_groups': groupId, 'stats.groups': { $elemMatch: { '_group': groupId }}}
    //             //     });
    //             // const cursor = db.collection('inventory').find({
    //                 //     instock: { $elemMatch: { qty: 5, warehouse: 'A' } }
    //                 // });

    //             // const group = await Group.findByIdAndUpdate({
    //             //         _id: groupId
    //             //     }, {
    //             //         $pull: { "crm_custom_fields.$[field].values": value }
    //             //     }, {
    //             //         arrayFilters: [{ "field._id": fieldId }],
    //             //         new: true
    //             //     }).select('crm_custom_fields');
    //         } else {
    //             contacts = await Contact.find({
    //                     $and: [
    //                         { _group: groupId },
    //                         { name: { $regex: req.query.companySearchText, $options: 'i' } }
    //                     ]
    //                 })
    //                 .sort('name')
    //                 .populate('_company', '_id name description company_pic')
    //                 .lean();
    //         }

    //         if (!contacts) {
    //             return sendError(res, new Error('Oops, contacts not found!'), 'Contacts not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Contacts found!',
    //             contacts: contacts
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };
    
    // /**
    //  * This function fetches a crm contact corresponding to the @constant contactId 
    //  * @param req - @constant contactId
    //  */
    // async getCRMContact(req: Request, res: Response) {
    //     try {
    //         const contact = await Contact.findOne({
    //                 _id: req.params.contactId
    //             })
    //             .populate('_company', '_id name description company_pic')
    //             .lean();

    //         if (!contact) {
    //             return sendError(res, new Error('Oops, contact not found!'), 'Contact not found, Invalid contactId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Contact found!',
    //             contact: contact
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };
    
    // /**
    //  * This function removes a crm contact
    //  * @param req - @constant contactId
    //  */
    // async removeCRMContact(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const contactId = req.params.contactId

    //         const contact = await Contact.findOneAndDelete({_id: contactId}).lean();

    //         return res.status(200).json({
    //             message: 'Contact deleted successfully!',
    //             contact: contact
    //           });
    //     } catch (error) {
    //         return sendError(res, error, 'Internal Server Error!', 500);
    //     }
    // }

    // /**
    //  * This function updates a crm contact
    //  * @param req - @constant contactData
    //  */
    // async updateCRMContact(req: Request, res: Response) {
    //     try {
    //         const { contactId } = req.params;
    //         const { contactData } = req.body;

    //         const contact = await Contact.findOneAndUpdate({
    //                 _id: contactId 
    //             }, {
    //                 $set : { 
    //                     name: contactData?.name,
    //                     description: contactData?.description,
    //                     phones: contactData?.phones,
    //                     emails: contactData?.emails,
    //                     links: contactData?.links,
    //                     _company: contactData?._company,
    //                     position: contactData?.position,
    //                     crm_custom_fields: contactData?.crm_custom_fields
    //                 }
    //             }, {
    //                 new: true
    //             })
    //             .sort('name')
    //             .populate('_company', '_id name description company_pic')
    //             .lean();

    //         if (!contact) {
    //             return sendError(res, new Error('Oops, contact not found!'), 'Contact not found, Invalid contactId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Contact updated!',
    //             contact: contact
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function creates a crm contact
    //  * @param req - @constant contactData
    //  */
    // async createCRMContact(req: Request, res: Response) {
    //     try {
    //         const { contactData } = req.body;

    //         let contact = await Contact.create(contactData);

    //         if (!contact) {
    //             return sendError(res, new Error('Oops, contact not created!'), 'Contact not found, Invalid contact data!', 404);
    //         }

    //         contact = await Contact.findOne({
    //                 _id: contact._id
    //             })
    //             .populate('_company', '_id name description company_pic')
    //             .lean();

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Contact created!',
    //             contact: contact
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };
    
    // /**
    //  * This function fetches a crm contact corresponding to the @constant contactId 
    //  * @param req - @constant contactId
    //  */
    // async getCRMCompany(req: Request, res: Response) {
    //     try {
    //         const company = await Company.findOne({
    //                 _id: req.params.companyId
    //             })
    //             .lean();

    //         if (!company) {
    //             return sendError(res, new Error('Oops, company not found!'), 'Company not found, Invalid companyId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Company found!',
    //             company: company
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async getGroupCRMCompanies(req: Request, res: Response) {
    //     try {
    //         const companies = await Company.find({
    //                 _group: req.params.groupId
    //             })
    //             .sort('name')
    //             .lean();

    //         if (!companies) {
    //             return sendError(res, new Error('Oops, companies not found!'), 'Companies not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Companies found!',
    //             companies: companies
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async searchGroupCRMCompanies(req: Request, res: Response) {
    //     try {
    //         const companies = await Company.find({
    //                 $and: [
    //                     { _group: req.params.groupId },
    //                     { name: { $regex: req.query.companySearchText, $options: 'i' } }
    //                 ]
    //             })
    //             .sort('name')
    //             .lean();

    //         if (!companies) {
    //             return sendError(res, new Error('Oops, companies not found!'), 'Companies not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Companies found!',
    //             companies: companies
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function updates a crm company
    //  * @param req - @constant companyData
    //  */
    // async updateCRMCompany(req: Request, res: Response) {
    //     try {
    //         const { companyId } = req.params;
    //         const { companyData } = req.body;

    //         let company = await Company.findOneAndUpdate({
    //                 _id: companyId 
    //             }, {
    //                 $set : { 
    //                     name: companyData?.name,
    //                     description: companyData?.description,
    //                     crm_custom_fields: companyData?.crm_custom_fields,
    //                 }
    //             }, {
    //                 new: true
    //             })
    //             .sort('name')
    //             .lean();

    //         // Check if group already exist with the same groupId
    //         if (!company) {
    //             return sendError(res, new Error('Oops, company not found!'), 'Company not found, Invalid companyId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Company updated!',
    //             company: company
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function creates a crm company
    //  * @param req - @constant companyData
    //  */
    // async createCRMCompany(req: Request, res: Response) {
    //     try {
    //         const { companyData } = req.body;

    //         let company = await Company.create(companyData);

    //         if (!company) {
    //             return sendError(res, new Error('Oops, company not created!'), 'Company not found, Invalid company data!', 404);
    //         }

    //         company = await Company.findOne({
    //                 _id: company._id
    //             })
    //             .lean();

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Company created!',
    //             company: company
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };
    
    // /**
    //  * This function removes a crm company
    //  * @param req - @constant companyId
    //  */
    // async removeCRMCompany(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const companyId = req.params.companyId

    //         const company = await Company.findOneAndDelete({_id: companyId}).lean();

    //         return res.status(200).json({
    //             message: 'Company deleted successfully!',
    //             company: company
    //           });
    //     } catch (error) {
    //         return sendError(res, error, 'Internal Server Error!', 500);
    //     }
    // }
    
    // /**
    //  * This function fetches a crm contact corresponding to the @constant contactId 
    //  * @param req - @constant contactId
    //  */
    // async getCRMProduct(req: Request, res: Response) {
    //     try {
    //         const product = await Product.findOne({
    //                 _id: req.params.productId
    //             })
    //             .lean();

    //         if (!product) {
    //             return sendError(res, new Error('Oops, product not found!'), 'Product not found, Invalid productId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Product found!',
    //             product: product
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function fetches all the crm products of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async getGroupCRMProducts(req: Request, res: Response) {
    //     try {
    //         const products = await Product.find({
    //                 _group: req.params.groupId
    //             })
    //             .sort('name')
    //             .lean();

    //         if (!products) {
    //             return sendError(res, new Error('Oops, products not found!'), 'Products not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Products found!',
    //             products: products
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async searchGroupCRMProducts(req: Request, res: Response) {
    //     try {
    //         const products = await Product.find({
    //                 $and: [
    //                     { _group: req.params.groupId },
    //                     { name: { $regex: req.query.productSearchText, $options: 'i' } }
    //                 ]
    //             })
    //             .sort('name')
    //             .lean();

    //         if (!products) {
    //             return sendError(res, new Error('Oops, products not found!'), 'Products not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Products found!',
    //             products: products
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function updates a crm product
    //  * @param req - @constant companyData
    //  */
    // async updateCRMProduct(req: Request, res: Response) {
    //     try {
    //         const { productId } = req.params;
    //         const { productData } = req.body;

    //         let product = await Product.findOneAndUpdate({
    //                 _id: productId 
    //             }, {
    //                 $set : { 
    //                     name: productData?.name,
    //                     description: productData?.description,
    //                     crm_custom_fields: productData?.crm_custom_fields,
    //                 }
    //             }, {
    //                 new: true
    //             })
    //             .sort('name')
    //             .lean();

    //         // Check if group already exist with the same groupId
    //         if (!product) {
    //             return sendError(res, new Error('Oops, product not found!'), 'Product not found, Invalid companyId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Product updated!',
    //             product: product
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // /**
    //  * This function creates a crm product
    //  * @param req - @constant productData
    //  */
    // async createCRMProduct(req: Request, res: Response) {
    //     try {
    //         const { productData } = req.body;

    //         let product = await Product.create(productData);

    //         if (!product) {
    //             return sendError(res, new Error('Oops, product not created!'), 'Product not found, Invalid product data!', 404);
    //         }

    //         product = await Product.findOne({
    //                 _id: product._id
    //             })
    //             .lean();

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Product created!',
    //             product: product
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };
    
    // /**
    //  * This function removes a crm product
    //  * @param req - @constant productId
    //  */
    // async removeCRMProduct(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const productId = req.params.productId

    //         const product = await Product.findOneAndDelete({_id: productId}).lean();

    //         return res.status(200).json({
    //             message: 'Product deleted successfully!',
    //             product: product
    //           });
    //     } catch (error) {
    //         return sendError(res, error, 'Internal Server Error!', 500);
    //     }
    // }

    // /**
    //  * This function is responsible for adding a new crm custom field for the particular group
    //  * @param { customFiel } req 
    //  * @param res 
    //  */
    // async addCRMCustomField(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Fetch the newCustomField from fileHandler middleware
    //     const newCustomField = req.body['newCustomField'];

    //     try {

    //         // Find the group and update their respective group avatar
    //         const group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 //custom_fields: newCustomField
    //                 $push: { "crm_custom_fields": newCustomField }
    //             }, {
    //                 new: true
    //             }).select('crm_custom_fields');

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields added!',
    //             crm_custom_fields: group.crm_custom_fields
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    // /**
    //  * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
    //  * @param req - @constant groupId
    //  */
    // async getCRMGroupCustomFields(req: Request, res: Response) {
    //     try {
    //         const { groupId } = req.params;

    //         // Find the Group based on the groupId
    //         const group = await Group.findOne({
    //                 _id: groupId
    //             }).select('crm_custom_fields').lean();

    //         // Check if group already exist with the same groupId
    //         if (!group) {
    //             return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
    //         }

    //         // Send the status 200 response
    //         return res.status(200).json({
    //             message: 'Group found!',
    //             crm_custom_fields: group.crm_custom_fields
    //         });
    //     } catch (err) {
    //         return sendError(res, err);
    //     }
    // };

    // async removeCRMCustomField(req: Request, res: Response, next: NextFunction) {
    //     // Fetch the groupId & fieldId
    //     const { groupId, fieldId } = req.params;

    //     try {

    //         let group = await Group.findById({
    //                 _id: groupId
    //             }).select('crm_custom_fields').lean();

    //         const cfIndex = group.crm_custom_fields.findIndex(cf => cf._id == fieldId);
    //         const cf = (group && group.crm_custom_fields) ? group.crm_custom_fields[cfIndex] : null;

    //         if (cf) {
    //             // remove the CF from the table widget
    //             group = await Group.findByIdAndUpdate({
    //                     _id: groupId
    //                 },
    //                 {
    //                     $pull: {
    //                         'crm_custom_fields_table_widget.selectTypeCFs': cf.name,
    //                         'crm_custom_fields_table_widget.inputTypeCFs': cf.name
    //                     }
    //                 }).lean();
                
    //             // remove the CF from the Columns where it is displayed
    //             await Column.updateMany({
    //                     _group: groupId
    //                 }, {
    //                     $pull: {
    //                         'crm_custom_fields_to_show': cf.name,
    //                         'crm_custom_fields_to_show_kanban': cf.name
    //                     }
    //                 }).lean();

    //             // remove the CF from the Flows where it is used
    //             const flows = await Flow.find({
    //                     _group: groupId
    //                 }).select('_id steps._id steps.trigger steps.action').lean();

    //             if (flows) {
    //                 flows.forEach(flow => {
    //                     if (flow.steps) {
    //                         flow.steps.forEach(async step => {
    //                             const triggerIndex = (step && step.trigger) ? step.trigger.findIndex(trigger => trigger.name == 'CRM Custom Field' && trigger.crm_custom_field.name == cf.name) : -1;
    //                             const actionIndex = (step && step.action) ? step.action.findIndex(action => action.name == 'CRM Custom Field' && action.crm_custom_field.name == cf.name) : -1;
    //                             if (triggerIndex >= 0 || actionIndex >= 0) {
    //                                 await Flow.findByIdAndUpdate({
    //                                         _id: flow._id
    //                                     }, {
    //                                         $pull: {
    //                                             steps: {_id: step._id}
    //                                         }
    //                                     });
    //                             }
    //                         });
    //                     }
    //                 });
    //             }
                
    //             /* TODO
    //             // remove the CF from the Posts where it is used
    //             await Post.updateMany({
    //                     _group: groupId
    //                 }, {
    //                     $unset: { cf.name: 1 }
    //                 });
    //             */
    //         }

    //         // Find the group and update their respective group avatar
    //         group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 $pull: {
    //                     crm_custom_fields: {
    //                         _id: fieldId
    //                     }
    //                 }
    //             }).lean();

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         console.log(err);
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // }

    // async addCRMCustomFieldValue(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Fetch the field and value from fileHandler middleware
    //     const fieldId = req.body['fieldId'];
    //     const value = req.body['value'];

    //     try {
    //         // Find the custom field in a group and add the value
    //         const group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 $push: { "crm_custom_fields.$[field].values": value }
    //             }, {
    //                 arrayFilters: [{ "field._id": fieldId }],
    //                 new: true
    //             }).select('crm_custom_fields')
    //             .lean();

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    // async setCRMCustomFieldDisplayKanbanCard(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Fetch the field and value from fileHandler middleware
    //     const fieldId = req.body['fieldId'];
    //     const display_in_kanban_card = req.body['display_in_kanban_card'];

    //     try {
    //         // Find the custom field in a group and add the value
    //         const group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 $set: { "crm_custom_fields.$[field].display_in_kanban_card": display_in_kanban_card }
    //             }, {
    //                 arrayFilters: [{ "field._id": fieldId }],
    //                 new: true
    //             }).select('crm_custom_fields')
    //             .lean();

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    // async setCRMCustomFieldType(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Fetch the field and value from fileHandler middleware
    //     const fieldId = req.body['fieldId'];
    //     const type = req.body['type'];

    //     try {
    //         // Find the custom field in a group and add the value
    //         const group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 $set: { "crm_custom_fields.$[field].type": type }
    //             }, {
    //                 arrayFilters: [{ "field._id": fieldId }],
    //                 new: true
    //             }).select('crm_custom_fields')
    //             .lean();

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    // async setCRMCustomFieldColor(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Fetch the field and value from fileHandler middleware
    //     const fieldId = req.body['fieldId'];
    //     const color = req.body['color'];

    //     try {
    //         // Find the custom field in a group and add the value
    //         const group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 $set: { "crm_custom_fields.$[field].badge_color": color }
    //             }, {
    //                 arrayFilters: [{ "field._id": fieldId }],
    //                 new: true
    //             }).select('crm_custom_fields')
    //             .lean();

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    // async removeCRMCustomFieldValue(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Find the custom field in a group and remove the value
    //     const fieldId = req.body['fieldId'];
    //     const value = req.body['value'];

    //     try {
    //         // Find the group and update their respective group avatar
    //         const group = await Group.findByIdAndUpdate({
    //                 _id: groupId
    //             }, {
    //                 $pull: { "crm_custom_fields.$[field].values": value }
    //             }, {
    //                 arrayFilters: [{ "field._id": fieldId }],
    //                 new: true
    //             }).select('crm_custom_fields');

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         console.log(err);
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    // /**
    //  * This function is responsible for updating the custom fields to show in the list view for the particular group
    //  * @param { column } req 
    //  * @param res 
    //  */
    // async updateCRMCustomFieldsToShow(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the fileName from fileHandler middleware
    //     const customFieldsData = req.body;
    //     const { groupId } = req.params;

    //     try {
    //         // Find the group and update their respective group avatar
    //         const group = await Group.updateOne({
    //                 _id: groupId
    //             }, {
    //                 "$set": {
    //                     "crm_custom_fields_to_show": customFieldsData.crmCustomFieldsToShow
    //                 }
    //             }, {
    //                 new: true
    //             }).select('crm_custom_fields_to_show');

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group crm custom fields to show updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };
    
    /**
     * This function removes a crm contact
     * @param req - @constant contactId
     */
    async removeCRMOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId, orderId } = req.params;

            let post = await Post.findByIdAndUpdate(
                { _id: postId },
                {
                    $pull: {
                        "crm.orders": {
                            _id: orderId
                        }
                    }
                },
                {
                    // arrayFilters: [{ "order._id": orderId }],
                    new: true
                }).lean();

            post = await Post.findOne({
                    _id: postId
                })
                .populate({ path: 'crm.orders._product', select: '_id name description crm_custom_fields' })
                .lean();

            return res.status(200).json({
                message: 'Order deleted successfully!',
                post: post
              });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function updates a crm contact
     * @param req - @constant contactData
     */
    async updateCRMOrder(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { orderData } = req.body;

            let post = await Post.findByIdAndUpdate(
                { _id: postId },
                {
                    $set: {
                        "crm.orders.$[order]._product": orderData._product,
                        "crm.orders.$[order].quantity": orderData.quantity,
                        "crm.orders.$[order].crm_custom_fields": orderData.crm_custom_fields
                    }
                },
                {
                    arrayFilters: [{ "order._id": orderData._id }],
                    new: true
                })
                .lean();

            post = await Post.findOne({
                    _id: postId
                })
                .populate({ path: 'crm.orders._product', select: '_id name description crm_custom_fields' })
                .lean();

            return res.status(200).json({
                message: 'Order updated!',
                post: post
              });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates a crm contact
     * @param req - @constant contactData
     */
    async createCRMOrder(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { orderData } = req.body;

            let post = await Post.findByIdAndUpdate(
                { _id: postId },
                {
                    $addToSet: { 'crm.orders': orderData }
                },
                { new: true });

            post = await Post.findOne({
                    _id: postId
                })
                .populate({ path: 'crm.orders._product', select: '_id name description crm_custom_fields' })
                .lean();

            return res.status(200).json({
                message: 'Order created successfully!',
                post: post
              });
        } catch (err) {
            return sendError(res, err);
        }
    };
}
