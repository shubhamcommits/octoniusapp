const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');
module.exports = {

    /*  ======================================================
        Middleware for token verification in request header
        ====================================================== */
    verifyToken(req, res, next) {

        if (!req.headers.authorization) {
            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        let token = req.headers.authorization.split(' ')[1];

        if (token == null) {
            return res.status(401).json({
                message: "Unauthorized request | token null"
            });
        }

        jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    message: "Unauthorized request | Invalid token"
                });
            } else if (!decoded) {
                return res.status(401).json({
                    message: "Unauthorized request | Invalid token"
                });
            } else {
                req.userId = decoded.subject;
                next();
            }
        });
    },
    /*===========================================================
       Middleware to verify that either user is logged in or not 
      =========================================================== */
    isLoggedIn(req, res, next) {

        Auth.findOne({
                _user: req.userId,
                isLoggedIn: true,
                token: req.headers.authorization.split(' ')[1]
            })
            .then((auth) => {
                if (auth !== null) {
                    next();
                } else {
                    res.status(401).json({
                        message: "Unauthorized request, Please sign in to continue"
                    });
                }
            })
            .catch((err) => {
                res.status(401).json({
                    message: "Unauthorized request, Please sign in to continue"
                });
            });
    }
}
