import { axios } from '../../utils';

/*  ===============================
 *  -- Management Service --
 *  ===============================
 */
export class ManagementService {

    MANAGEMENT_BASE_API_URL = process.env.MANAGEMENT_URL + '/api';

    callNewWorkplacesAvailable(environment: string) {
        try {
            return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/blockNewWorkplaces`, {
                params: {
                    environment: environment
                },
                
            });

        } catch (err) {
            throw (err);
        }
    }
}