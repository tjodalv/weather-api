'use strict';

const axios  = require('axios');
const qs     = require('querystring');
const cache  = require('../cache');

// Forecast API config object with default values
let config = {
    lang: 'en',
    units: 'metric',
    dataType: 'json'
};

const Forecast = {
    appId: '16f36d03799381f7afbd6dd4e976fb17',
    
    version: '2.5',

    baseUrl: 'https://api.openweathermap.org/data/',

    getLang: () => { config.lang; },

    setLang: (langCode) => {
        langCode = String(langCode).toLowerCase();
        let supported = [
            'ar', 'bg', 'ca', 'cz', 'de', 'el', 'en', 'fa', 'fi', 'fr', 'gl', 'hr',
            'hu', 'it', 'ja', 'kr', 'la', 'lt', 'mk', 'nl', 'pl', 'pt', 'ro', 'ru',
            'se', 'sk', 'sl', 'es', 'tr', 'ua', 'vi', 'zh_cn', 'zh_tw'
        ];

        if (supported.indexOf(langCode)) {
            config.lang = langCode;
        }
    },

    getUnits: () => { return config.units; },

    setUnits: (units) => {
        units = String(units).toLowerCase();
        let allowedTypes = ['standard', 'metric', 'imperial'];

        if (allowedTypes.indexOf(units) > -1) {
            config.units = units;
        }
    },

    getByCityName: (cityName, countryCode) => {
        if (countryCode) cityName += ','+ countryCode;
        return api('forecast', { q: cityName }).then(data => {
            //console.log(`  -> For city: ${cityName}`);
            return data;
        });
    },

    getByZipCode: (zip, countryCode) => {
        if (countryCode) zip += ','+ countryCode;
        return api('forecast', { zip }).then(data => {
            //console.log(`  -> For city ZIP: ${zip}`);
            return data;
        });
    },

    getByLocation: (lat, lon) => {
        return api('forecast', { lat, lon }).then(data => {
            //console.log(`  -> For location: ${lat}, ${lon}`);
            return data;
        });
    },

    buildServiceUrl: (url, data) => {
        let base = Forecast.baseUrl;
        base += (base.slice(-1) !== '/') ? '/' : '';

        let serviceUrl  = base + Forecast.version + '/'+ url;
        serviceUrl += '?'+ qs.stringify(data);
        return serviceUrl;
    }
};

function api(url, data) {
    data.mode  = config.dataType;
    data.APPID = Forecast.appId;
    data.units = config.units;
    data.lang  = config.lang;

    url = Forecast.buildServiceUrl(url, data);

    // get cached version
    let cacheKey = cache.hashUrl(url);
    let cacheValue;

    if (cacheValue = cache.get(cacheKey)) {
        // Function must return Promise, so we are returning Promise
        // resolved with data from cache
        return new Promise(resolve => {
            cacheValue.source = 'cache';  // debug only
            //console.log('Forecast from cache');
            resolve(cacheValue);
        });
    }

    // return API response as Promise object
    return axios({
            url,
            method: 'GET'
        })
        .then((resp) => {
            let data = resp.data;

            let dataExpires = new Date();
            dataExpires.setTime(dataExpires.getTime() + (1*60*60*1000));
            
            // store data in memory cache
            cache.set(cacheKey, data, dataExpires);

            //console.log('Forecast from API');

            data.source = 'api';  // debug only
            return data;
        })
        .catch(err => {
            console.log('Ups', err);
        });
}

module.exports = Forecast;