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

// // GET - Get all the crm information in a group
// routes.get('/:groupId/crm_info', crm.getGroupCRMInfo);

// // GET - Get all the crm contacts in a group
// routes.get('/:groupId/contacts', crm.getGroupCRMContacts);

// // GET - Search for companies in a group
// routes.get('/:groupId/searchContacts/:companyId', crm.searchGroupCRMContacts);

// // GET - Get a crm contact details
// routes.get('/:contactId/contact', crm.getCRMContact);

// // DELETE - Delete an contract
// routes.delete('/:contactId/contact', crm.removeCRMContact);

// // PUT - Update the contract
// routes.put('/:contactId/updateContact', crm.updateCRMContact);

// // POST - Add new contract
// routes.post('/createContact', crm.createCRMContact);

// // GET - Get a crm company details
// routes.get('/:companyId/company', crm.getCRMCompany);

// // GET - Get all the crm companies in a group
// routes.get('/:groupId/companies', crm.getGroupCRMCompanies);

// // GET - Search for companies in a group
// routes.get('/:groupId/searchCompanies', crm.searchGroupCRMCompanies);

// // PUT - Update the company
// routes.put('/:companyId/updateCompany/:workspaceId/:groupId', companyFileUploader, crm.updateCRMCompany);

// // POST - Add new company
// routes.post('/createCompany', crm.createCRMCompany);

// // DELETE - Delete an company
// routes.delete('/:companyId/company', crm.removeCRMCompany);

// // GET - Get a crm product details
// routes.get('/:productId/product', crm.getCRMProduct);

// // GET - Get all the crm products in a group
// routes.get('/:groupId/products', crm.getGroupCRMProducts);

// // GET - Search for products in a group
// routes.get('/:groupId/searchProducts', crm.searchGroupCRMProducts);

// // PUT - Update the product
// routes.put('/:productId/updateProduct/:groupId', crm.updateCRMProduct);

// // POST - Add new product
// routes.post('/createProduct', crm.createCRMProduct);

// // DELETE - Delete an product
// routes.delete('/:productId/product', crm.removeCRMProduct);

// // CUSTOM FIELDS

// // PUT - Save custom field
// routes.put('/:groupId/crmCustomFields', crm.addCRMCustomField);

// // GET - Get all the crm custom fields in a group
// routes.get('/:groupId/crmCustomFields', crm.getCRMGroupCustomFields);

// // DELETE - Delete custom field
// routes.delete('/:groupId/crmCustomFields/:fieldId', crm.removeCRMCustomField);

// // PUT - Add new value to a custom field
// routes.put('/:groupId/crmCustomFields/addValue', crm.addCRMCustomFieldValue);

// // PUT - Set the CF to be displayed in the kanban card
// routes.put('/:groupId/crmCustomFields/displayInKanbanCard', crm.setCRMCustomFieldDisplayKanbanCard);

// // PUT - Set the CF to be for company or contact or product
// routes.put('/:groupId/crmCustomFields/setCRMCustomFieldType', crm.setCRMCustomFieldType);

// // PUT - Set the CF color to be displayed
// routes.put('/:groupId/crmCustomFields/color', crm.setCRMCustomFieldColor);

// // PUT - Remove custom field value
// routes.put('/:groupId/crmCustomFields/removeValue', crm.removeCRMCustomFieldValue);

// // PUT - Save crm custom field to show
// routes.put('/:groupId/crmCustomFieldsToShow', crm.updateCRMCustomFieldsToShow);

// DELETE - Delete an order
routes.delete('/:postId/crmOrder/:orderId', crm.removeCRMOrder);

// PUT - Update the order
routes.put('/:postId/crmOrder', crm.updateCRMOrder);

// POST - Add new order
routes.post('/:postId/crmOrder', crm.createCRMOrder);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as crmRoutes }