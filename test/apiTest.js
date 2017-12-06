'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const server = require('../src/server');
const weather = require('../src/weather');

chai.use(chaiHttp);

const authData = new Buffer('apiuser:rMt4uscV!3m').toString('base64');

function checkSuccessResponse(res) {
    /*console.log('CHECKING SUCCESS RESPONSE');
    console.log(res);*/

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.have.property('data');
    expect(res.body.data).to.have.property('forecast');
    expect(res.body.data.forecast).to.be.an('array').to.have.lengthOf(8);
}

describe('/GET forecast/city/Berlin', () => {
    it('It should return error for calling API without authentication', done => {
        chai.request(server)
            .get('/forecast/city/berlin')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('status', 'error');
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('code', 100);
                done();
            });
    });

    it('it should GET forecast for Berlin from OpenWeather API', done => {
        chai.request(server)
            .get('/forecast/city/berlin')
            .set('Authorization', `Basic ${authData}`)
            .end((err, res) => {
                checkSuccessResponse(res);
                done();
            });
    });

    it('it should GET forecast for Berlin from cache', done => {
        chai.request(server)
            .get('/forecast/city/Berlin')
            .set('Authorization', `Basic ${authData}`)
            .end((err, res) => {
                checkSuccessResponse(res);
                done();
            });
    });
});

describe('/GET forecast/location/49.460983/11.061859', () => {
    it('It should GET forecast for location Nuremberg from OpenWeather API', done => {
        chai.request(server)
            .get('/forecast/location/49.460983/11.061859')
            .set('Authorization', `Basic ${authData}`)
            .end((err, res) => {
                checkSuccessResponse(res);
                done();
            });
    });

    it('It should GET forecast for location Nuremberg from cache', done => {
        chai.request(server)
            .get('/forecast/location/49.460983/11.061859')
            .set('Authorization', `Basic ${authData}`)
            .end((err, res) => {
                checkSuccessResponse(res);
                done();
            });
    });
});

describe('Call API to get geographical coordinates for city name', () => {
    it('It should GET coordinates for Paris', done => {
        weather.getCityLatLon('Paris')
            .then(res => {
                console.log(res);
                expect(res).to.have.property('latitude');
                expect(res).to.have.property('longitude');
                done();
            })
    });
});