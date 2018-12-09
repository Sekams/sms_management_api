'use strict';

const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");
const SMS = require("../models/sms");
const GeneralUtilities = require("../utilities/general_utilities");
const AuthTokenHelper = require("../utilities/authentication_helper");

//Handle all requests with the smsId parameter
router.param("contactId", (req, res, next, contactId) => {
  Contact.findById(contactId, (error, contact) => {
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
router.post("/signup", (req, res, next) => {
  if (GeneralUtilities.validateParams(req, ["firstName", "lastName", "phoneNumber", "password"])) {
    Contact.find({ phoneNumber: req.body.phoneNumber }, (error, exstingContact) => {
      if (error) return next(error);
      if (exstingContact.length > 0) {
        error = new Error("Contact already exists");
        error.status = 409;
        return next(error);
      } else {
        const contact = new Contact(req.body);
        contact.phoneNumber = req.body.phoneNumber;
        contact.save((error, contact) => {
          if (error) return next(error);
          res.status(201);
          res.json({
            token: AuthTokenHelper.generateToken(contact.id)
          });
        });
      }
    });
  } else {
    const error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//POST /contact/signin
//Route for contacts to login
router.post("/signin", (req, res, next) => {
  if (GeneralUtilities.validateParams(req, ["phoneNumber", "password"])) {
    Contact.findOne({ phoneNumber: req.body.phoneNumber }, (error, contact) => {
      if (error) return next(error);
      if (contact) {
        contact.comparePassword(req.body.password, (error, isMatching) => {
          if (error) return next(error);
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
    const error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//DELETE /contact/:contactId
//Route for specific contact deleting
router.delete("/:contactId", AuthTokenHelper.verifyToken, (req, res, next) => {
  const contactId = req.contact._id;
  req.contact.remove(function (error) {
    if (error) return next(error);
    SMS.deleteMany({ sender: contactId }, error => {
      if (error) return next(error);
    });
    const jsonResult = { response: "Contact was deleted" };
    SMS.updateMany({ reciepient: contactId }, { reciepient: "Deleted" }, (error, res1) => {
      if (error) return next(error);
      jsonResult.updatedSMSList = res1;
      res.json(jsonResult);
    });
  });
});

module.exports = router;
