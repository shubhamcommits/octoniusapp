import { axios } from '../../utils';

/*  ===============================
 *  -- Management Service --
 *  ===============================
 */
export class ManagementService {

    MANAGEMENT_BASE_API_URL = process.env.MANAGEMENT_URL + '/api';

    callNewWorkplacesAvailable(environment: string) {
        if (process.env.NODE_ENV == 'development') {
            return new Promise((resolve, reject) => {
                resolve({
                    data: {
                        message: 'Creation of New Workplaces availability is true',
                        status: true
                    }
                });
            });
        } else {
            return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/blockNewWorkplaces`, {
                params: {
                    environment: environment
                }
            });
        }
        try {
            

        } catch (err) {
            throw (err);
        }
    }
}