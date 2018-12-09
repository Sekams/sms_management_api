'use strict';

const express = require("express");
const app = express();
const jsonParser = require("body-parser").json;
const logger = require("morgan");
const contactRoutes = require("./routes/contact_routes");
const smsRoutes = require("./routes/sms_routes");
const { CONTACTS_BASE_URL, SMS_BASE_URL } = require('./utilities/constants');


//Log requests in console using Morgan
if (process.env.NODE_ENV === 'dev') {
    app.use(logger("dev"));
}

//Parse JSON objects from the requests
app.use(jsonParser());

//Handle Database Connections using Mongoose Library
const mongoose = require("mongoose");

//Connect to the database
mongoose.set('useCreateIndex', true);
mongoose.connect(
    `${process.env.DATABASE_URI}${process.env.NODE_ENV === 'test' ? '_test' : ''}`,
    { useNewUrlParser: true }
);

//Assign database connection to a constiable
const db = mongoose.connection;

//Catch database connection errors
db.on("error", function (err) {
    if (process.env.NODE_ENV === 'dev') console.error("connection error:", err);
});

//Open database connection
db.once("open", function () {
    if (process.env.NODE_ENV === 'dev') console.log("db connection successful");
});

//Handle Cross Origin Request permissions
app.use(function (req, res, next) {
    //Allow requests from all origins
    res.header("Access-Control-Allow-Origin", "*");
    //All Headers that are allowed 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === "OPTIONS") {
        //All Methods allowed on the API 
        res.header("Access-Control-Allow-Methods", "POST, PUT, DELETE");
        return res.status(200).json({});
    }
    next();
});

//Handle HTTP routes
app.use(CONTACTS_BASE_URL, contactRoutes);
app.use(SMS_BASE_URL, smsRoutes);

//Welcome page
app.use("/", function (req, res, next) {
    res.json({ message: 'Welcome to the SMS Management API' });
});

//Catch 404 errors and foward them to the error handler
app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

//Error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

//Pick the port from environment constiables if it exists or set it to 3000
const port = process.env.PORT || 3000;

//Run the application on specified port
app.listen(port, function () {
    if (process.env.NODE_ENV === 'dev') console.log("Express server is listening on port", port);
});

module.exports = app;
