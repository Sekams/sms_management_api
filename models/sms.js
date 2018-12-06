'use scrict';

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//Define sms schema
var SMSSchema = new Schema({
    sender: { type: String, required: true },
    reciepient: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'sent'  },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

//Add update method to the sms Schema
SMSSchema.method("update", function (updates, callback) {
    Object.assign(this, updates, { updatedAt: new Date() });
    this.save(callback);
});

//Get sms model from schema
var sms = mongoose.model("sms", SMSSchema);

//Export sms model
module.exports = sms;
