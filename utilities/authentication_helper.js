'use strict'

var jwt = require('jsonwebtoken');
var Contact = require('../models/contact');

const generateToken = function (contactId) {
    return jwt.sign({ id: contactId }, process.env.SECRET, {
        expiresIn: 86400 // expires in 24 hours
    });
}

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.SECRET, function (error, decoded) {
            if (error) return next(error);
            Contact.findById(decoded.id, function (error, contact) {
                if (!contact) {
                    error = new Error("Contact Not Found");
                    error.status = 404;
                    return next(error);
                } else {
                    req.contact = contact;
                    req.body.contactId = decoded.id;
                    return next();
                }
            });
        });
    } else {
        var error = new Error("No access token");
        error.status = 401;
        return next(error);
    }
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
