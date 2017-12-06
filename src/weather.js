'use strict';

const axios = require('axios');
const cache = require('./cache');
const NodeGeocoder = require('node-geocoder');
const forecast = require('./api/openweather');
const sunrise  = require('./api/sunrise-sunset');

// Initialize NodeGeocoder lib
const geocoder = NodeGeocoder({
    httpAdapter: 'https',
    //apiKey: 'AIzaSyAytVu6bKwAFq4RlC2EVQgc6DyNALJZWRw'
});

const WeatherAPI = {
    // Expose libraries
    forecast,
    sunrise,

    units: {
        metric: {
            wind_speed: 'm/s',
            temp: '°C',
            wind_direction: '°'
        },
        imperial: {
            wind_speed: 'mph',
            temp: '°F',
            wind_direction: '°'
        },
        standard: {
            wind_speed: 'm/s',
            temp: '°K',
            wind_direction: '°'
        }
    },

    getByCityName: (cityName, countryCode) => {
        //const sunriseResp = sunrise.get();
        if (!cityName) {
            return new Promise((resolve, reject) => {
                reject('City name not provided');
            });
        }

        // Convert address into lat, long coordinates
        return WeatherAPI
            .getCityLatLon(cityName, countryCode)
            .then(resp => {
                const lat = resp.latitude;
                const lng = resp.longitude;

                return axios
                    .all([
                        sunrise.get(lat, lng), 
                        forecast.getByCityName(cityName, countryCode)
                    ])
                    .then(axios.spread(WeatherAPI.processData));
            });
    },

    getByLocation: (lat, lng) => {
        return axios
            .all([
                sunrise.get(lat, lng),
                forecast.getByLocation(lat, lng)
            ])
            .then(axios.spread(WeatherAPI.processData));
    },

    makeWeatherEntry: (obj) => {
        let d = new Date(obj.dt * 1000);
        let weather = obj.weather[0];

        let units = WeatherAPI.units[ forecast.getUnits() ];

        const entry = {
            date: d.toISOString().substr(0, 10),
            time: d.toISOString().substr(11, 5),
            temp: {
                current: parseInt(obj.main.temp) +' '+ units.temp,
                min: parseInt(obj.main.temp_min) +' '+ units.temp,
                max: parseInt(obj.main.temp_max) +' '+ units.temp 
            },
            wind: {
                speed: obj.wind.speed +' '+ units.wind_speed,
                deg: obj.wind.deg,
            },
            rain: null,
            snow: null,
            weather: weather.main,
            description: weather.description,
            icon: `http://openweathermap.org/img/w/${weather.icon}.png`
        };

        if (obj.rain && obj.rain.hasOwnProperty('3h')) {
            entry.rain = obj.rain['3h'] +' mm';
        }

        if (obj.snow && obj.snow.hasOwnProperty('3h')) {
            entry.snow = obj.snow['3h'] +' mm';
        }

        return entry;
    },

    processData: (sunriseResp, forecastResp) => {
        let final = {
            date: new Date(),
            daylight: {
                length: new Date(sunriseResp.day_length * 1000).toISOString().substr(11, 8),
                sunrise: new Date(sunriseResp.sunrise),
                sunset: new Date(sunriseResp.sunset),
            },
            forecast: [],
        };

        if (forecastResp) {
            let entries = forecastResp.list;
            // Take first 8 entries
            entries.length = 8;

            final.forecast = entries.map(item => {
                return WeatherAPI.makeWeatherEntry(item);
            });
        }

        //console.log(forecastResp);

        if (forecastResp.city) {
            final.city = forecastResp.city.name;
        }

        return final;
    },

    getCityLatLon: (cityName, countryCode) => {
        if (!cityName) {
            return new Promise((resolve, reject) => {
                reject('City name not provided');
            });
        }

        if (countryCode) cityName += ', '+ countryCode;
        cityName = cityName.toLowerCase();

        // Get item from cache
        let cacheValue;
        if (cacheValue = cache.get(cityName)) {
            return new Promise(resolve => {
                //console.log(`-- Coordinates for ${cityName} from cache.`);
                resolve(cacheValue);
            });
        }

        return geocoder.geocode(cityName)
            .then(resp => {
                if (resp && resp.length > 0) {
                    // Cache data forever
                    cache.set(cityName, resp[0], new Date(2100, 1, 1));

                    //console.log(`-- Coordinates for ${cityName} from API.`);
                    return resp[0];
                }
                return null;
            })
            .catch(err => {
                console.log('Error converting city name into coordinates.', err);
            });
    }
};

module.exports = WeatherAPI;