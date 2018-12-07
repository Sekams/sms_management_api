'use strict';

const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");
const SMS = require("../models/sms");
const GeneralUtilities = require("../utilities/general_utilities");
const AuthTokenHelper = require("../utilities/authentication_helper");

//Handle all requests with the smsId parameter
router.param("smsId", (req, res, next, smsId) => {
    SMS.findById(smsId, (error, sms) => {
        if (error) return next(error);
        if (!sms) {
            error = new Error("SMS Not Found");
            error.status = 404;
            return next(error);
        }
        req.sms = sms;
        return next();
    });
});

//GET /sms
//Route for smsList collection
router.get("/", AuthTokenHelper.verifyToken, (req, res, next) => {
    SMS.find({ $or: [{ reciepient: req.loggedInContact._id }, { sender: req.loggedInContact._id }]})
        .sort({ createdAt: -1 })
        .exec((error, smsList) => {
            if (error) return next(error);
            res.json(smsList);
        });
});

//POST /sms
//Route for creating smsList
router.post("/", AuthTokenHelper.verifyToken, (req, res, next) => {
    if (GeneralUtilities.validateParams(req, ["reciepient", "message"])) {
        req.body.sender = req.loggedInContact._id;
        Contact.findById(req.body.reciepient, (error, reciepient) => {
            if (error) return next(error);
            if (!reciepient) {
                error = new Error("Reciepient Not Found");
                error.status = 404;
                return next(error);
            }
            const sms = new SMS(req.body);
            sms.save((error, sms) => {
                if (error) return next(error);
                res.status(201);
                res.json(sms);
            });
        });
    } else {
        const error = new Error("Parameter(s) missing");
        error.status = 422;
        return next(error);
    }
});

//GET /sms/:smsId
//Route for specific sms reading
router.get("/:smsId", AuthTokenHelper.verifyToken, (req, res) => {
    const { sender, reciepient } = req.sms;
    const userId = req.loggedInContact._id;
    if (![sender, reciepient].includes(userId)) {
        const error = new Error("You are not allowed to view this sms");
        error.status = 403;
        return next(error);
    }
    res.json(req.sms);        
});

//PUT /sms/:smsId
//Route for specific sms updating
router.put("/:smsId", AuthTokenHelper.verifyToken, (req, res) => {
    const { sender } = req.sms;
    const userId = req.loggedInContact._id;
    if (sender != userId) {
        const error = new Error("You are not allowed to edit this sms");
        error.status = 403;
        return next(error);
    }
    req.body.status = 'edited';
    req.sms.update(req.body, (error, result) => {
        if (error) return next(error);
        res.json(result);
    });
});

//DELETE /sms/:smsId
//Route for specific sms deleting
router.delete("/:smsId", AuthTokenHelper.verifyToken, (req, res) => {
    const { sender } = req.sms;
    const userId = req.loggedInContact._id;
    if (sender != userId) {
        const error = new Error("You are not allowed to delete this sms");
        error.status = 403;
        return next(error);
    }
    req.sms.remove((error) => {
        if (error) return next(error);
        res.json({
            response: "SMS was deleted"
        });
    });
});

module.exports = router;