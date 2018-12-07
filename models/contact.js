'use scrict';

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

//Helps protect against dictionary attacks, brute force and pre-computed rainbow table attacks
const SALT_WORK_FACTOR = 10;

//Define contact schema
const ContactShema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ContactShema.pre("save", next => {
    const contact = this;
    // only hash the password if it has been modified (or is new)
    if (!contact.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(contact.password, salt, (err, hash) => {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            contact.password = hash;
            next();
        });
    });
});

//Compare hashed password with that in database
ContactShema.method("comparePassword", (candidatePassword, next) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return next(err);
        next(null, isMatch);
    });
});

//Add update method to the contact Schema
ContactShema.method("update", (updates, callback) => {
    Object.assign(this, updates, { updatedAt: new Date() });
    this.save(callback);
});

//Get contact model from schema
const contact = mongoose.model("contact", ContactShema);

//Export contact model
module.exports = contact;
