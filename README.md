# The SMS Management API

**The SMS Management API** is a RESTful API for serving data persistence methods to The SMS Management application.

## Live API
WIP

## Getting Started
To be able to use the application locally, one should follow the guidelines highlighted below.

1. Clone/download the application Github repository by running the command below in a git shell
```
git clone https://github.com/Sekams/sms_management_api.git
```
2. Navigate (cd) to a application root directory and install NPM, Yarn and Node.js via the terminal (guides [here](https://docs.npmjs.com/getting-started/installing-node) and [here](https://yarnpkg.com/lang/en/docs/install).)
 
3. Install the application requirements by running the code below in the terminal at the application root directory:
```
yarn install
```

4. Install MongoDB (guide [here](https://docs.mongodb.com/manual/installation/))

5. Set up the environment variables in a file named `.env` at the application root directory and follow the structure in the `.env.example` file.

6. After all the requirements are installed on the local application instance, run the application by running the following code in the terminal at the application root directory:
```
yarn start
```
7. After successfully running the application, one can explore the features of The SMS Management API by accessing: `http://localhost:<PORT>` (replace `<PORT>` with port number) in any client of choice

## Features
* User Account management (Signup, Signin, Authentication and Removal)
* SMS sending, reception and deletion

## EndPoints

| Type | API EndPoint | Requires Token | Description |
| --- | --- | --- | --- |
| POST | /api/v1/contacts/signup | NO | Registers a user and requires **firstName**, **lastName**, **phoneNumber** and **password** as string arguments |
| POST | /api/v1/contacts/signin | NO | Logs regitered users in and requires **phoneNumber** and **password** as string arguments |
| DELETE | /api/v1/contacts/\<contactId\> | YES | Deletes a particular contact (user) with the id **contactId** and all the messages they sent|
| POST | /api/v1/sms | YES | Creates a new SMS message for the logged in user and requires **reciepient** and **message** as string arguments (`reciepient` is the id of the reciepient) |
| GET | /api/v1/sms | YES | Retrieves all available SMS messages that were sent or received by the logged in user |
| GET | /api/v1/sms/\<smsId\> | YES | Retrives a particular sms with the id **smsId** that was sent or received by the logged in user |
| PUT | /api/v1/sms/\<smsId\> | YES | Updates a particular sms with the id **smsId** that was sent by the logged in user and takes either **reciepient**, **message** or both as string arguments |
| DELETE | /api/v1/sms/\<smsId\> | YES | Deletes a particular sms with the id **smsId** that was sent by the logged in user |
