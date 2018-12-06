'use strict';

var express = require("express");
var router = express.Router();
var Contact = require("../models/contact");
var SMS = require("../models/sms");
const GeneralUtilities = require("../utilities/general_utilities");
const AuthTokenHelper = require("../utilities/authentication_helper");

//Handle all requests with the smsId parameter
router.param("smsId", function (req, res, next, smsId) {
    SMS.findById(smsId, function (error, sms) {
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
router.get("/", AuthTokenHelper.verifyToken, function (req, res, next) {
    SMS.find({})
        .sort({ createdAt: -1 })
        .exec(function (error, smsList) {
            if (error) return next(error);
            res.json(smsList);
        });
});

//POST /sms
//Route for creating smsList
router.post("/", AuthTokenHelper.verifyToken, function (req, res, next) {
    if (GeneralUtilities.validateParams(req, ["reciepient", "message"])) {
        req.body.sender = req.loggedInContact._id;
        Contact.findById(req.body.reciepient, function (error, reciepient) {
            if (error) return next(error);
            if (!reciepient) {
                error = new Error("Reciepient Not Found");
                error.status = 404;
                return next(error);
            }
            var sms = new SMS(req.body);
            sms.save(function (error, sms) {
                if (error) return next(error);
                res.status(201);
                res.json(sms);
            });
        });
    } else {
        var error = new Error("Parameter(s) missing");
        error.status = 422;
        return next(error);
    }
});

//GET /sms/:smsId
//Route for specific sms reading
router.get("/:smsId", function (req, res) {
    res.json(req.sms);
});

//PUT /sms/:smsId
//Route for specific sms updating
router.put("/:smsId", AuthTokenHelper.verifyToken, function (req, res) {
    req.sms.update(req.body, function (error, result) {
        if (error) return next(error);
        res.json(result);
    });
});

//DELETE /sms/:smsId
//Route for specific sms deleting
router.delete("/:smsId", AuthTokenHelper.verifyToken, function (req, res) {
    req.sms.remove(function (error) {
        if (error) return next(error);
        res.json({
            response: "SMS was deleted"
        });
    });
});

module.exports = router;