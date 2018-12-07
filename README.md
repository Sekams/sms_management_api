# The SMS Management API

**The SMS Management API** is a RESTful API for serving data persistence methods to The SMS Management application.

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

5. Create a Mongo Database and add take note of its name to be used in the next step. Run the command below in a fresh terminal instance to start MongoDB
```
mongod
```

6. Set up the environment variables in a file named `.env` at the application root directory and follow the structure in the `.env.example` file.

7. After all the requirements are installed on the local application instance, run the application by running the following code in the terminal at the application root directory:
```
yarn start
```
8. After successfully running the application, one can explore the features of The SMS Management API by accessing: `http://localhost:<PORT>` (replace `<PORT>` with port number) in any client of choice

## Features
* User Account management (Signup, Signin, Authentication and Removal)
* SMS sending, reception and deletion

## EndPoints

| Type | API EndPoint | Requires Token | Description |
| --- | --- | --- | --- |
| POST | /api/v1/contacts/signup | NO | Registers a user and requires **firstName**, **lastName**, **phoneNumber** and **password** as string arguments<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"firstName": "Chris",<br/>&nbsp;&nbsp;"lastName": "Griffin",<br/>&nbsp;&nbsp;"phoneNumber": "256776123456",<br/>&nbsp;&nbsp;"password": "12345"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMGEzYjM5MmEzZTViMTkxNjlkMmMwYSIsImlhdCI6MTU0NDE3NDM5MywiZXhwIjoxNTQ0MjYwNzkzfQ.MTfUZcZks7uXrGCkJyBJLG2hWqK2KYElU7qEvBSk4eA"<br/>}</pre> |
| POST | /api/v1/contacts/signin | NO | Logs regitered users in and requires **phoneNumber** and **password** as string arguments<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"phoneNumber": "256776123456",<br/>&nbsp;&nbsp;"password": "12345"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMGEzYjM5MmEzZTViMTkxNjlkMmMwYSIsImlhdCI6MTU0NDE3NDM5MywiZXhwIjoxNTQ0MjYwNzkzfQ.MTfUZcZks7uXrGCkJyBJLG2hWqK2KYElU7qEvBSk4eA"<br/>}</pre> |
| DELETE | /api/v1/contacts/\<contactId\> | YES | Deletes a particular contact (user) with the id **contactId** and all the messages they sent<br/><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"response": "Contact was deleted"<br/>&nbsp;&nbsp;"updatedSMSList": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"n": 1,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"nModified": 1,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"ok": 1<br/>&nbsp;&nbsp;}<br/>}</pre> |
| POST | /api/v1/sms | YES | Creates a new SMS message for the logged in user and requires **reciepient** and **message** as string arguments (`reciepient` is the id of the reciepient)<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"reciepient": "5c0a3ab712744b18a4fa362e",<br/>&nbsp;&nbsp;"message": "How are you?"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"status": "sent",<br/>&nbsp;&nbsp;"_id": "5c0a45ad2a3e5b19169d2c0b",<br/>&nbsp;&nbsp;"reciepient": "5c0a3ab712744b18a4fa362e",<br/>&nbsp;&nbsp;"message": "How are you?",<br/>&nbsp;&nbsp;"sender": "5c04190dfea442238107588d",<br/>&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;"__v": 0<br/>}</pre> |
| GET | /api/v1/sms | YES | Retrieves all available SMS messages that were sent or received by the logged in user<br/><br/> **Sample Response**<br/><pre>[<br/>&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;"status": "sent",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0a45ad2a3e5b19169d2c0b",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"reciepient": "5c0a3ab712744b18a4fa362e",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"message": "How are you?",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"sender": "5c04190dfea442238107588d",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0<br/>&nbsp;&nbsp;},<br/>&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;"status": "sent",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0a2e11a099630b50fc3834",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"reciepient": "Deleted",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"message": "How are you?",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"sender": "5c04190dfea442238107588d",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T08:23:45.260Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T08:23:45.260Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0<br/>&nbsp;&nbsp;}<br/>]</pre> |
| GET | /api/v1/sms/\<smsId\> | YES | Retrives a particular sms with the id **smsId** that was sent or received by the logged in user<br/><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"status": "sent",<br/>&nbsp;&nbsp;"_id": "5c0a45ad2a3e5b19169d2c0b",<br/>&nbsp;&nbsp;"reciepient": "5c0a3ab712744b18a4fa362e",<br/>&nbsp;&nbsp;"message": "How are you?",<br/>&nbsp;&nbsp;"sender": "5c04190dfea442238107588d",<br/>&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;"__v": 0<br/>}</pre> |
| PUT | /api/v1/sms/\<smsId\> | YES | Updates a particular sms with the id **smsId** that was sent by the logged in user and takes either **reciepient**, **message** or both as string arguments<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"message": "How are you, bro?"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"status": "edited",<br/>&nbsp;&nbsp;"_id": "5c0a45ad2a3e5b19169d2c0b",<br/>&nbsp;&nbsp;"reciepient": "5c0a3ab712744b18a4fa362e",<br/>&nbsp;&nbsp;"message": "How are you, bro?",<br/>&nbsp;&nbsp;"sender": "5c04190dfea442238107588d",<br/>&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;"updatedAt": "2018-12-07T10:39:11.652Z",<br/>&nbsp;&nbsp;"__v": 0<br/>}</pre> |
| DELETE | /api/v1/sms/\<smsId\> | YES | Deletes a particular sms with the id **smsId** that was sent by the logged in user<br/><br/>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"response": "SMS was deleted"<br/>}</pre> |


## Testing
The application's tests can be executed by running the code below within the terminal at the application root directory:
```
yarn test
```