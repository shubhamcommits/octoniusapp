module.exports = {
    //setting user role 
    setUserRole(invited_users_list, user_email) {
        return new Promise(function (resolve, reject) {

            let role = 'member';

            if (invited_users_list.length < 1) {
                resolve({
                    role: role
                })
            }
            for (let i = 0; i < invited_users_list.length; i++) {
                if (invited_users_list[i].email === user_email) {
                    let role = invited_users_list[i].role;
                    resolve({
                        role: role
                    })
                }
                if ((i + 1) == invited_users_list.length) {
                    resolve({
                        role: role
                    })
                }
            }
        });
    }
}