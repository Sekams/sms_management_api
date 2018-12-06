'use strict';

var express = require("express");
var router = express.Router();
var Contact = require("../models/contact");
var SMS = require("../models/sms");
const GeneralUtilities = require("../utilities/general_utilities");
const AuthTokenHelper = require("../utilities/authentication_helper");

//Handle all requests with the smsId parameter
router.param("contactId", function (req, res, next, contactId) {
  Contact.findById(contactId, function (error, contact) {
    if (error) return next(error);
    if (!contact) {
      error = new Error("Contact Not Found");
      error.status = 404;
      return next(error);
    }
    req.contact = contact;
    return next();
  });
});

//POST /contact/signup
//Route for creating contacts
router.post("/signup", function (req, res, next) {
  if (GeneralUtilities.validateParams(req, ["firstName", "lastName", "phoneNumber", "password"])) {
    Contact.find({ phoneNumber: req.body.phoneNumber }, function (error, exstingContact) {
      if (error) return next(error);
      if (exstingContact.length > 0) {
        error = new Error("Contact already exists");
        error.status = 409;
        return next(error);
      } else {
        var contact = new Contact(req.body);
        contact.phoneNumber = req.body.phoneNumber;
        contact.save(function (error, contact) {
          if (error) return next(error);
          res.status(201);
          res.json({
            token: AuthTokenHelper.generateToken(contact.id)
          });
        });
      }
    });
  } else {
    var error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//POST /contact/signin
//Route for contacts to login
router.post("/signin", function (req, res, next) {
  if (GeneralUtilities.validateParams(req, ["phoneNumber", "password"])) {
    Contact.findOne({ phoneNumber: req.body.phoneNumber }, function (error, contact) {
      if (error) return next(error);
      if (contact) {
        contact.comparePassword(req.body.password, function (error, isMatching) {
          if (error) throw error;
          if (isMatching) {
            res.status = 200;
            res.json({
              token: AuthTokenHelper.generateToken(contact.id)
            });
          } else {
            error = new Error("Invalid phone number or password");
            error.status = 401;
            return next(error);
          }
        });
      } else {
        error = new Error("Invalid phone number or password");
        error.status = 401;
        return next(error);
      }
    });
  } else {
    var error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//DELETE /contact/:contactId
//Route for specific contact deleting
router.delete("/:contactId", AuthTokenHelper.verifyToken, function (req, res, next) {
  var contactId = req.contact._id;
  req.contact.remove(function (error) {
    if (error) return next(error);
    SMS.deleteMany({ sender: contactId }, function (error) {
      if (error) return next(error);
    });
    var jsonResult = { response: "Contact was deleted" };
    SMS.updateMany({ reciepient: contactId }, { reciepient: "Deleted" }, function (error, res1) {
      if (error) return next(error);
      jsonResult.updatedSMSList = res1;
      res.json(jsonResult);
    });
  });
});

module.exports = router;
