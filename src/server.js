'use strict';
const express = require('express');
const auth = require('basic-auth')
const weather = require('./weather');
const responses = require('./responses');
const app = express();

const APP_PORT = 8000;

// Register middleware that will check if request is authenticated
app.use('/forecast*', function authenticateUser(req, res, next) {
    const user = auth(req);

    if (!user || user.name !== 'apiuser' || user.pass !== 'rMt4uscV!3m') {
        // Generate error JSON response
        let err = responses.error("Authentication error. Invalid credentials!", 100);
        
        res.setHeader('WWW-Authenticate', 'Basic realm="Weather API"');
        res.status(401).json(err);
        return;
    }

    next();
});

// Register middleware function that will configure Weather API
app.use('/forecast*', function configureApi(req, res, next) {
    let units = req.query.units;
    let lang  = req.query.lang;

    // configure weather API before processing request
    weather.forecast.setUnits(units);
    weather.forecast.setLang(lang);

    next();
});

app.get('/', (req, res) => {
    res.send('Weather API');
});

app.get('/forecast/city/:city/:countryCode?', (req, res) => {
    weather.getByCityName(req.params.city, req.params.countryCode)
        .then(results => {
            const success = responses.success(results);
            res.status(200).json(success);
        })
        .catch(ex => {
            //let err = responses.error("Weather API unavailable");
            res.json(ex);
        });
});

app.get('/forecast/location/:lat/:lng', (req, res) => {
    weather.getByLocation(req.params.lat, req.params.lng)
        .then(results => {
            const success = responses.success(results);
            res.status(200).json(success);
        })
        .catch(ex => {
            res.json(ex);
        });
});

app.listen(APP_PORT);
console.log('Application running on port: %d', APP_PORT);

module.exports = app; // for testing