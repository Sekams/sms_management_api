'use strict'

const request = require('supertest');
const chai = require('chai');
const SMS = require('../models/sms');
const Contact = require('../models/contact');
const app = require('../app');
const expect = chai.expect;
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
    it('should create a new contact', done => {
      request(app)
        .post(`${CONTACTS_BASE_URL}/signup`)
        .send(contact)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.body.token.length).to.be.greaterThan(100);
          done()
        });
    });
  });

  describe(`GET ${SMS_BASE_URL}`, () => {
    it('should list all sms messages', done => {
      token = generateToken('some-contact-id');
      const smsToCreate = new SMS(sms);
      request(app)
      .get(`${SMS_BASE_URL}/`)
      .set('x-access-token', token)
      .end((error, response) => {
        expect(response.statusCode).to.equal(404)
        expect(response.body.error.message).to.equal('Contact Not Found');
        done()
      });
});
  });
});
