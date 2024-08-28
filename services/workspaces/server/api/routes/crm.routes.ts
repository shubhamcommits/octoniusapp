import express from 'express';
import { CRMController } from '../controllers';
import { Auths, companyFileUploader } from '../../utils';

const routes = express.Router();
const crm = new CRMController();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Get all the crm information in a group
routes.get('/crm_info', crm.getCRMInfo);

// GET - Get all the crm contacts in a group
routes.get('/contacts', crm.getCRMContacts);

// GET - Search for companies in a group
routes.get('/searchContacts/:companyId', crm.searchCRMContacts);

// GET - Get a crm contact details
routes.get('/:contactId/contact', crm.getCRMContact);

// DELETE - Delete an contract
routes.delete('/:contactId/contact', crm.removeCRMContact);

// PUT - Update the contract
routes.put('/:contactId/updateContact', crm.updateCRMContact);

// POST - Add new contract
routes.post('/createContact', crm.createCRMContact);

// GET - Get a crm company details
routes.get('/:companyId/company', crm.getCRMCompany);

// GET - Get all the crm companies in a group
routes.get('/companies', crm.getCRMCompanies);

// GET - Search for companies in a group
routes.get('/searchCompanies', crm.searchCRMCompanies);

// PUT - Update the company
routes.put('/:companyId/updateCompany/:workspaceId', companyFileUploader, crm.updateCRMCompany);

// POST - Add new company
routes.post('/createCompany', crm.createCRMCompany);

// DELETE - Delete an company
routes.delete('/:companyId/company', crm.removeCRMCompany);

// GET - Get a crm product details
routes.get('/:productId/product', crm.getCRMProduct);

// GET - Get all the crm products in a group
routes.get('/products', crm.getCRMProducts);

// GET - Search for products in a group
routes.get('/searchProducts', crm.searchCRMProducts);

// PUT - Update the product
routes.put('/:productId/updateProduct', crm.updateCRMProduct);

// POST - Add new product
routes.post('/createProduct', crm.createCRMProduct);

// DELETE - Delete an product
routes.delete('/:productId/product', crm.removeCRMProduct);

// CUSTOM FIELDS

// PUT - Save custom field
routes.put('/crmCustomFields', crm.addCRMCustomField);

// GET - Get all the crm custom fields in a group
routes.get('/crmCustomFields', crm.getCRMCustomFields);

// DELETE - Delete custom field
routes.delete('/crmCustomFields/:fieldId', crm.removeCRMCustomField);

// PUT - Add new value to a custom field
routes.put('/crmCustomFields/addValue', crm.addCRMCustomFieldValue);

// PUT - Set the CF to be for company or contact or product
routes.put('/crmCustomFields/setCRMCustomFieldType', crm.setCRMCustomFieldType);

// PUT - Set the CF color to be displayed
routes.put('/crmCustomFields/color', crm.setCRMCustomFieldColor);

// PUT - Remove custom field value
routes.put('/crmCustomFields/removeValue', crm.removeCRMCustomFieldValue);

// PUT - Save crm custom field to show
routes.put('/crmCustomFieldsToShow', crm.updateCRMCustomFieldsToShow);

//////////////
// PUT - migrateCRM
// routes.put('/migrateCRM', crm.migrateCRMFromGroupToGlobal);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as crmRoutes }