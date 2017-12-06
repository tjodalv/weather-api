'use strict';

const qs = require('querystring');
const axios = require('axios');
const cache = require('../cache');

const SunriseSunset = {
    baseUrl: 'https://api.sunrise-sunset.org/json',

    /*
     * Get information about sunrise and sunset for specified
     * location and date
     *  @param  float        Latitude
     *  @param  float        Longitude
     *  @param  string|date  Optional date
     *  @return object       Promise
     */
    get: (lat, lng, date) => {
        date = date || 'today';

        let params = { lat, lng, formatted: 0, date };
        let url = SunriseSunset.baseUrl +'?'+ qs.stringify(params);
        
        let cacheValue;                     // will hold value from cache
        let cacheKey = cache.hashUrl(url);  // create cache item name

        // Try to get item from cache
        if (cacheValue = cache.get(cacheKey)) {
            cacheValue.source = 'cache';   // debug only

            return new Promise(resolve => {
                //console.log('Sunrise/Sunset from cache');
                //console.log(`  -> For location: ${lat}, ${lng} for ${date}`);
                resolve(cacheValue);
            });
        }

        // Make call to service API
        return axios({ url, method: 'GET' })
            .then(resp => {
                return SunriseSunset._handleApiResponse(resp, cacheKey);
            })
            .then((data) => {
                //console.log(`  -> For location: ${lat}, ${lng} for ${date}`);
                return data;
            });
    },

    /*
     * Function that handles response from API service
     *  @param  object  Service response data as JSON object
     *  @param  string  Cache item name
     *  @return object  Promise object
     */
    _handleApiResponse: (resp, cacheKey) => {
        let data = resp.data;

        //console.log('SunriseSunset response', data);
        
        if (!data) {
            console.log('SunriseSunsetAPI: no data received!');
            return null;
        }

        if (String(data.status).toLowerCase() === 'ok' && data.results) {
            data = data.results;

            // Set cache expire date (1 hour)
            let dataExpires = new Date();
            dataExpires.setTime(dataExpires.getTime() + (1*60*60*1000));

            // Store item in cache
            cache.set(cacheKey, data, dataExpires);

            data.source = 'api'; // debug only
            //console.log(`Sunrise/Sunset from API`);
            return data;
        }
    }
}

module.exports = SunriseSunset;