import { Company, Contact } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';

/*  ===================
 *  -- CRM METHODS --
 *  ===================
 * */

export class CRMController {

    /**
     * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async getGroupCRMContacts(req: Request, res: Response) {
        try {
            const contacts = await Contact.find({
                    _group: req.params.groupId
                })
                .sort('name')
                .populate('company_history._company', '_id name description company_pic')
                .lean();

            if (!contacts) {
                return sendError(res, new Error('Oops, contacts not found!'), 'Contacts not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Contacts found!',
                contacts: contacts
            });
        } catch (err) {
            return sendError(res, err);
        }
    };
    
    /**
     * This function fetches a crm contact corresponding to the @constant contactId 
     * @param req - @constant contactId
     */
    async getCRMContact(req: Request, res: Response) {
        try {
            const contact = await Contact.findOne({
                    _id: req.params.contactId
                })
                .populate('company_history._company', '_id name description company_pic')
                .lean();

            if (!contact) {
                return sendError(res, new Error('Oops, contact not found!'), 'Contact not found, Invalid contactId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Contact found!',
                contact: contact
            });
        } catch (err) {
            return sendError(res, err);
        }
    };
    
    /**
     * This function removes a crm contact
     * @param req - @constant contactId
     */
    async removeCRMContact(req: Request, res: Response, next: NextFunction) {
        try {
            const contactId = req.params.contactId

            const contact = await Contact.findOneAndDelete({_id: contactId}).lean();

            return res.status(200).json({
                message: 'Contact deleted successfully!',
                contact: contact
              });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
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

            const contact = await Contact.findOneAndUpdate({
                    _id: contactId 
                }, {
                    $set : { 
                        name: contactData?.name,
                        description: contactData?.description,
                        phones: contactData?.phones,
                        emails: contactData?.emails,
                        links: contactData?.links,
                        company_history: contactData?.company_history
                    }
                }, {
                    new: true
                })
                .sort('name')
                .populate('company_history._company', '_id name description company_pic')
                .lean();

            if (!contact) {
                return sendError(res, new Error('Oops, contact not found!'), 'Contact not found, Invalid contactId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Contact updated!',
                contact: contact
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates a crm contact
     * @param req - @constant contactData
     */
    async createCRMContact(req: Request, res: Response) {
        try {
            const { contactData } = req.body;

            let contact = await Contact.create(contactData);

            if (!contact) {
                return sendError(res, new Error('Oops, contact not created!'), 'Contact not found, Invalid contact data!', 404);
            }

            contact = await Contact.findOne({
                    _id: contact._id
                })
                .populate('company_history._company', '_id name description company_pic')
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Contact created!',
                contact: contact
            });
        } catch (err) {
            return sendError(res, err);
        }
    };
    
    /**
     * This function fetches a crm contact corresponding to the @constant contactId 
     * @param req - @constant contactId
     */
    async getCRMCompany(req: Request, res: Response) {
        try {
            const company = await Company.findOne({
                    _id: req.params.companyId
                })
                .lean();

            if (!company) {
                return sendError(res, new Error('Oops, company not found!'), 'Company not found, Invalid companyId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Company found!',
                company: company
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches all the crm contacts of a group corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async getGroupCRMCompanies(req: Request, res: Response) {
        try {
            const companies = await Company.find({
                    _group: req.params.groupId
                })
                .sort('name')
                .lean();

            if (!companies) {
                return sendError(res, new Error('Oops, companies not found!'), 'Companies not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Companies found!',
                companies: companies
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function updates a crm company
     * @param req - @constant companyData
     */
    async updateCRMCompany(req: Request, res: Response) {
        try {
            const { companyId } = req.params;
            const { companyData } = req.body;

            let company = await Company.findOneAndUpdate({
                    _id: companyId 
                }, {
                    $set : { 
                        name: companyData?.name,
                        description: companyData?.description
                    }
                }, {
                    new: true
                })
                .sort('name')
                .lean();

            // Check if group already exist with the same groupId
            if (!company) {
                return sendError(res, new Error('Oops, company not found!'), 'Company not found, Invalid companyId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Company updated!',
                company: company
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates a crm company
     * @param req - @constant companyData
     */
    async createCRMCompany(req: Request, res: Response) {
        try {
            const { companyData } = req.body;

            let company = await Company.create(companyData);

            if (!company) {
                return sendError(res, new Error('Oops, company not created!'), 'Company not found, Invalid company data!', 404);
            }

            company = await Company.findOne({
                    _id: company._id
                })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Company created!',
                company: company
            });
        } catch (err) {
            return sendError(res, err);
        }
    };
    
    /**
     * This function removes a crm company
     * @param req - @constant companyId
     */
    async removeCRMCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.params.companyId

            const company = await Company.findOneAndDelete({_id: companyId}).lean();

            return res.status(200).json({
                message: 'Company deleted successfully!',
                company: company
              });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }
}
