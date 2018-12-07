'use strict'

const jwt = require('jsonwebtoken');
const Contact = require('../models/contact');

const generateToken = contactId => {
    return jwt.sign({ id: contactId }, process.env.SECRET, {
        expiresIn: 86400 // expires in 24 hours
    });
}

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.SECRET, (error, decoded) => {
            if (error) return next(error);
            Contact.findById(decoded.id, (error, contact) => {
                if (!contact) {
                    error = new Error("Contact Not Found");
                    error.status = 404;
                    return next(error);
                } else {
                    req.loggedInContact = contact;
                    return next();
                }
            });
        });
    } else {
        const error = new Error("No access token");
        error.status = 401;
        return next(error);
    }
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
