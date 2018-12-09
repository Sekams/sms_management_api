'use strict'

const request = require('supertest');
const chai = require('chai');
const SMS = require('../models/sms');
const Contact = require('../models/contact');
const app = require('../app');
const expect = chai.expect;
const { generateToken, verifyToken } = require('../utilities/authentication_helper');
const { CONTACTS_BASE_URL, SMS_BASE_URL } = require('../utilities/constants');

let token, contact, contact1, newContact;

describe('Tests for the SMS Management API', () => {
  beforeEach(done => {
    contact = {
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      phoneNumber: '0974333222',
      password: '1234'
    };

    contact1 = {
      firstName: 'other-first-name',
      lastName: 'other-last-name',
      phoneNumber: '0974333220',
      password: '1234'
    };

    newContact = {
      firstName: 'new-first-name',
      lastName: 'new-last-name',
      phoneNumber: '0974333221',
      password: '1234'
    };

    done();
  });

  afterEach(done => {
    SMS.deleteMany({}, () => { });
    Contact.deleteMany({}, () => { });
    done();
  });

  describe(`Contact Model`, () => {
    it('should update contact', () => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        contactSaved.update({ '_id': contactSaved._id }, { phoneNumber: '0772001111' }, (error, updatedMeta) => {
          expect(updatedMeta.nModified).to.equal(1);
        });
      });
    });

  });

  describe(`POST ${CONTACTS_BASE_URL}/signup`, () => {
    it('should create a new contact', done => {
      request(app)
        .post(`${CONTACTS_BASE_URL}/signup`)
        .send(newContact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.body.token.length).to.be.greaterThan(100);
          done()
        });
    });

    it('should not create a duplicate contact', done => {
      const contactToSave = new Contact(newContact);
      contactToSave.save((error, contactSaved) => {
        request(app)
          .post(`${CONTACTS_BASE_URL}/signup`)
          .send(newContact)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(409)
            expect(response.body.error.message).to.equal('Contact already exists');
            done()
          });
      });
    });

    it('should not create a contact with missing parameters', done => {
      delete newContact.firstName;
      request(app)
        .post(`${CONTACTS_BASE_URL}/signup`)
        .send(newContact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(422)
          expect(response.body.error.message).to.equal('Parameter(s) missing');
          done()
        });
    });

    it('should not create a contact with empty parameters', done => {
      newContact.phoneNumber = '';
      request(app)
        .post(`${CONTACTS_BASE_URL}/signup`)
        .send(newContact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(500)
          expect(response.body.error.message).to.equal('contact validation failed: phoneNumber: Path `phoneNumber` is required.');
          done()
        });
    });

    it('should not create a contact with invalid parameters', done => {
      newContact.phoneNumber = Error();
      request(app)
        .post(`${CONTACTS_BASE_URL}/signup`)
        .send(newContact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(500)
          expect(response.body.error.message).to.equal('Cast to string failed for value "{}" at path "phoneNumber" for model "contact"');
          done()
        });
    });

  });

  describe(`POST ${CONTACTS_BASE_URL}/signin`, () => {
    it('should log contact in', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        request(app)
          .post(`${CONTACTS_BASE_URL}/signin`)
          .send(contact)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(200)
            expect(response.body.token.length).to.be.greaterThan(100);
            done()
          });
      });
    });

    it('should not log contact in with wrong password', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        contact.password = 'password';
        request(app)
          .post(`${CONTACTS_BASE_URL}/signin`)
          .send(contact)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(401)
            expect(response.body.error.message).to.equal('Invalid phone number or password');
            done()
          });
      });
    });

    it('should not log a contact in with missing parameters', done => {
      delete contact.phoneNumber;
      request(app)
        .post(`${CONTACTS_BASE_URL}/signin`)
        .send(contact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(422)
          expect(response.body.error.message).to.equal('Parameter(s) missing');
          done()
        });
    });

    it('should not log a contact in with invalid phoneNumber', done => {
      contact.phoneNumber = Error();
      request(app)
        .post(`${CONTACTS_BASE_URL}/signin`)
        .send(contact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(500)
          expect(response.body.error.message).to.equal('Cast to string failed for value "{}" at path "phoneNumber" for model "contact"');
          done()
        });
    });

    it('should not log a contact in with invalid password', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        contact.password = Error();
        request(app)
          .post(`${CONTACTS_BASE_URL}/signin`)
          .send(contact)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500)
            expect(response.body.error.message).to.equal('data and hash must be strings');
            done()
          });
      });
    });

    it('should not log a contact in that does not exist', done => {
      request(app)
        .post(`${CONTACTS_BASE_URL}/signin`)
        .send(newContact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(401)
          expect(response.body.error.message).to.equal('Invalid phone number or password');
          done()
        });
    });

  });

  describe(`DELETE ${CONTACTS_BASE_URL}/:contactId`, () => {
    it('should delete contact', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        const contactId = contactSaved._id;
        token = generateToken(contactId);
        request(app)
          .delete(`${CONTACTS_BASE_URL}/${contactId}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(200)
            expect(response.body.response).to.equal('Contact was deleted');
            done()
          });
      });
    });

    it('should not delete contact if no valid contact is logged in', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        const contactId = contactSaved._id;
        token = generateToken('5c0a45ad2a3e5b19169d2c0b');
        request(app)
          .delete(`${CONTACTS_BASE_URL}/${contactId}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(404)
            expect(response.body.error.message).to.equal('Contact Not Found');
            done()
          });
      });
    });

    it('should not delete contact if token is malformed', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        const contactId = contactSaved._id;
        token = 'wmrfmoernewnemwofeorfmeomowemr'
        request(app)
          .delete(`${CONTACTS_BASE_URL}/${contactId}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500)
            expect(response.body.error.message).to.equal('jwt malformed');
            done()
          });
      });
    });

    it('should not delete contact with malformed id', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        const contactId = contactSaved._id;
        token = generateToken(contactId)
        request(app)
          .delete(`${CONTACTS_BASE_URL}/randomId`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500)
            expect(response.body.error.message).to.equal('Cast to ObjectId failed for value "randomId" at path "_id" for model "contact"');
            done()
          });
      });
    });

    it('should not delete contact that does not exist', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        const contactId = contactSaved._id;
        token = generateToken(contactId)
        request(app)
          .delete(`${CONTACTS_BASE_URL}/5c0a45ad2a3e5b19169d2c0b`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(404)
            expect(response.body.error.message).to.equal('Contact Not Found');
            done()
          });
      });
    });

  });

  describe(`GET ${SMS_BASE_URL}`, () => {
    it('should fail to list sms messages', done => {
      request(app)
        .get(`${SMS_BASE_URL}/`)
        .end((error, response) => {
          expect(response.statusCode).to.equal(401)
          expect(response.body.error.message).to.equal('No access token');
          done()
        });
    });

    it('should list sms messages from a user', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            reciepient: contactSaved1._id,
            message: 'some message'
          }
          request(app)
            .post(`${SMS_BASE_URL}/`)
            .send(smsToSave)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response1) => {
              expect(response1.statusCode).to.equal(201)
              request(app)
                .get(`${SMS_BASE_URL}/`)
                .set('x-access-token', token)
                .end((error, response2) => {
                  expect(response2.statusCode).to.equal(200)
                  expect(response2.body[0].message).to.equal('some message');
                  done()
                });
            });
        });
      });
    });

  });

  describe(`POST ${SMS_BASE_URL}/`, () => {
    it('should not post sms message with non existent reciepient', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        const smsToSave = {
          reciepient: '5c0a45ad2a3e5b19169d2c0b',
          message: 'some message'
        }
        request(app)
          .post(`${SMS_BASE_URL}/`)
          .send(smsToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(404);
            expect(response.body.error.message).to.equal('Reciepient Not Found');
            done();
          });
      });
    });

    it('should not post sms message with malformed reciepient', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        const smsToSave = {
          reciepient: 'reciepient',
          message: 'some message'
        }
        request(app)
          .post(`${SMS_BASE_URL}/`)
          .send(smsToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500);
            expect(response.body.error.message).to.equal('Cast to ObjectId failed for value "reciepient" at path "_id" for model "contact"');
            done();
          });
      });
    });

    it('should not post sms message with missing reciepient', done => {
      const contactToSave = new Contact(contact);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        const smsToSave = {
          message: 'some message'
        }
        request(app)
          .post(`${SMS_BASE_URL}/`)
          .send(smsToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(422);
            expect(response.body.error.message).to.equal('Parameter(s) missing');
            done();
          });
      });
    });

    it('should not post sms message with invalid message', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            reciepient: contactSaved1._id,
            message: Error()
          }
          request(app)
            .post(`${SMS_BASE_URL}/`)
            .send(smsToSave)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(500);
              expect(response.body.error.message).to.equal('sms validation failed: message: Cast to String failed for value "{}" at path "message"');
              done();
            });
        });
      });
    });

  });

  describe(`GET ${SMS_BASE_URL}/:smsId`, () => {
    it('should fail to fetch sms message with different sender', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved1._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          }
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .get(`${SMS_BASE_URL}/${smsSaved._id}`)
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(403)
                expect(response.body.error.message).to.equal('You are not allowed to view this sms');
                done()
              });
          });
        });
      });
    });

    it('should fetch sms message', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          };
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .get(`${SMS_BASE_URL}/${smsSaved._id}`)
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(200)
                expect(response.body.message).to.equal('message to be sent');
                done()
              });
          });
        });
      });
    });

  });

  describe(`PUT ${SMS_BASE_URL}/:smsId`, () => {
    it('should fail to edit sms message with different sender', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved1._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          }
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .put(`${SMS_BASE_URL}/${smsSaved._id}`)
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(403)
                expect(response.body.error.message).to.equal('You are not allowed to edit this sms');
                done()
              });
          });
        });
      });
    });

    it('should edit sms message', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          };
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .put(`${SMS_BASE_URL}/${smsSaved._id}`)
              .send({ message: 'the message changed' })
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(200)
                expect(response.body.message).to.equal('the message changed');
                done()
              });
          });
        });
      });
    });

    it('should fail to edit sms message with malformed id', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          };
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .put(`${SMS_BASE_URL}/invalidId`)
              .send({ message: 'the message changed' })
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(500);
                expect(response.body.error.message).to.equal('Cast to ObjectId failed for value "invalidId" at path "_id" for model "sms"');
                done()
              });
          });
        });
      });
    });

    it('should fail to edit sms message with invalid id', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          };
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .put(`${SMS_BASE_URL}/5c0a45ad2a3e5b19169d2c0b`)
              .send({ message: 'the message changed' })
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                expect(response.body.error.message).to.equal('SMS Not Found');
                done()
              });
          });
        });
      });
    });

    it('should fail to edit sms message with invalid message', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          };
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .put(`${SMS_BASE_URL}/${smsSaved._id}`)
              .send({ message: Error() })
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(500);
                expect(response.body.error.message).to.equal('sms validation failed: message: Cast to String failed for value "{}" at path "message"');
                done()
              });
          });
        });
      });
    });

  });

  describe(`DELETE ${SMS_BASE_URL}/:smsId`, () => {
    it('should fail to delete sms message with different sender', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved1._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          }
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .delete(`${SMS_BASE_URL}/${smsSaved._id}`)
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(403)
                expect(response.body.error.message).to.equal('You are not allowed to delete this sms');
                done()
              });
          });
        });
      });
    });

    it('should delete sms message', done => {
      const contactToSave = new Contact(contact);
      const contactToSave1 = new Contact(contact1);
      contactToSave.save((error, contactSaved) => {
        token = generateToken(contactSaved._id)
        contactToSave1.save((error1, contactSaved1) => {
          const smsToSave = {
            sender: contactSaved._id,
            reciepient: contactSaved1._id,
            message: 'message to be sent'
          };
          const savedSMS = new SMS(smsToSave);
          savedSMS.save((error, smsSaved) => {
            request(app)
              .delete(`${SMS_BASE_URL}/${smsSaved._id}`)
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(200)
                expect(response.body.response).to.equal('SMS was deleted');
                done()
              });
          });
        });
      });
    });

  });

});
