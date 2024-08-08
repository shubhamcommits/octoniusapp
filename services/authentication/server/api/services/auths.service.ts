import { token } from 'morgan';
import { Auths, axios, PasswordHelper, sendError } from '../../utils';
import { Account, Group, User, Workspace } from '../models';

// Authentication Utilities Class
const auths = new Auths();

// Password Helper Class
const passwordHelper = new PasswordHelper();

/*  ===============================
 *  -- AuthsService Service --
 *  ===============================
 */
export class AuthsService {

    MANAGEMENT_BASE_API_URL = process.env.MANAGEMENT_URL + '/api';

    async signUp(userData: any) {
      try {
        if (userData.password) {
          // Encrypting user password
          const passEncrypted: any = await passwordHelper.encryptPassword(userData.password);

          // If we are unable to encrypt the password and store into the server
          if (!passEncrypted.password) {
              throw new Error('Unable to encrypt the password to the server');
          }

          // Updating the password value with the encrypted password
          userData.password = passEncrypted.password;
        }

        // Adding _workspace property to userData variable
        userData._workspaces = [];

        // Create new user with all the properties of userData
        let account: any = await Account.create(userData);

        return account;
      } catch (error) {
        throw new Error('Unable to create the account, some unexpected error occurred!');
      }
    }

    /**
     * This function fetches the prices for the subscription for the currently loggedIn user
     */
    getSubscriptionProducts() {
        try {
            if (process.env.NODE_ENV == 'development') {
              return new Promise((resolve, reject) => {
                resolve({
                  data: {
                    message: 'You are in a DEVELOPMENT environment',
                    products: [
                      {
                        id: process.env.STRIPE_TEAM_PRODUCT_ID,
                        name: 'Team Product',
                        monthly_price: 10,
                        yearly_price: 100
                      }
                      , {
                        id: process.env.STRIPE_BUSINESS_PRODUCT_ID,
                        name: 'Business Product',
                        monthly_price: 15,
                        yearly_price: 150
                      }
                      // , {
                      //   id: process.env.STRIPE_ONPREMISE_PRODUCT_ID,
                      //   name: 'On-Premise'
                      // }
                    ]
                  }
                });
              });
            } else {
              return axios.get(this.MANAGEMENT_BASE_API_URL + `/billings/get-subscription-products`, {});
            }
        } catch (err) {
            throw (err);
        }
    }
}