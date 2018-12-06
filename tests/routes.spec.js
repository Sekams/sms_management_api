'use strict'

const request = require('supertest');
const SMS = require('../models/sms');
const Contact = require('../models/contact');
const app = require('../app');
const { generateToken } = require('../utilities/authentication_helper');
const { CONTACTS_BASE_URL, SMS_BASE_URL } = require('../utilities/constants');

let token;
const contact = {
  firstName: 'some-first-name',
  lastName: 'some-last-name',
  phoneNumber: '0974333222',
  password: '1234'
};
const sms = {
  sender: 'some-sender',
  reciepient: 'some-reciepient',
  message: "some message"
};

describe('Tests for the SMS Management API sms routes', () => {
  beforeEach(async done => {
    done();
  });

  afterEach(done => {
    SMS.deleteMany({}, () => { });
    Contact.deleteMany({}, () => { });
    done();
  });

  describe(`POST ${CONTACTS_BASE_URL}/signup`, () => {
    it('should create a new contact', () => {
      request(app)
        .post(`${CONTACTS_BASE_URL}/signup`)
        .send(contact)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .end((error, response) => {
          expect(response.body).to.have.lengthOf(1);
        });
    });
  });

  describe(`GET ${SMS_BASE_URL}`, () => {
    it('should list all sms messages', () => {
      token = generateToken('some-contact-id');
      const smsToCreate = new SMS(sms);

      smsToCreate.save(function (error, smsCreated) {
        if (error) return next(error);
        request(app)
          .set('x-access-token', token)
          .get(`${SMS_BASE_URL}/`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((error, response) => {
            expect(response.body).to.have.lengthOf(1);
          });
      });
    });
  });
});
