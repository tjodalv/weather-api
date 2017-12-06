# Weather API
Simple Weather API back-end that fetchs forecast for today every 3 hours using OpenWeatherMap API and for sunrise and sunset times program is using Sunrise-sunset.org free API.

## What information this API provide?

Weather API provide weather forecast data for current date and for specified location or specified city name. Data provide forecast for every 3 hours for the day ahead, so data are structured in that way. More information about API responses will be covered in this manual. Weather API is using OpenWeatherMap API for forecast data and SunriseSunset API for information about day length, twilight, sunrise and sunset times.
Available data about weather that Weather API provides:
* General weather description with icon  
  Simple description about weather condition. (cloudy, clear, heavy snow ...) with icon displaying weather condition
* Information about temperature (current, minimum, maximum)  
  In large cities temperature may vary, so min. and max. temperature datum is provided to display that variation.
* Wind information  
  Wind speed is provided in meter per seconds, and wind direction is provided as degrees.
* Information about precipitation  
  If there are any precipitations (snowing or raining) it will be provided in mm/m2.
* Sunrise/Sunset information  
  Day length on specified location as well as sunrise and sunset times.

## How to access Weather API

Weather API is consumed as HTTP service that returns data in JSON format. In order to access API you need to authenticate by using Basic HTTP Authentication method. Url and authentication data are provided below.

Base URL of Weather API  
https://infinite-brook-26595.herokuapp.com/

Credientials for API access using Basic HTTP Authentication

Username: apiuser  
Password:  rMt4uscV!3m  

**Successful API response**  
Success response will return HTTP status code 200 and JSON with this structure. Property status: 'ok' tells that response is successful and property data contain forecast data
~~~~
{
  "status": "ok",
  "data": {...}
}
~~~~

**Error API response**  
Error responses can return any of HTTP status codes from 400 – 599, and JSON response is like this:
~~~~
{
  "status": "error",
  "code": 100,
  "message": "Authorization failed. Incorrect credientials."
}
~~~~

## Get weather forecast for specified city

Weather data for specified city is available at URL:

~~~~
GET /city/{cityName}/{countryCode} HTTP/1.1
Authorization: Basic  YXBpdXNlcjpyTXQ0dXNjViEzbQ==
Host: localhost:8000
~~~~

URL segments enclosed with currly braces are parameters that you provide. Required params are marked with red color. Country code parameter is optional.

## Get weather forecast for specified location

When fetching data for location you need to provide geographical coordinates, latitude and logitude as URL parameters like this:

~~~~
GET /location/{lat}/{lon} HTTP/1.1
Authorization: Basic  YXBpdXNlcjpyTXQ0dXNjViEzbQ==
Host: localhost:8000
~~~~

Both parameters are required.

## Configuration querystring parameters

When performing Weather API calls you can specify configuration parameters to customize weather units or change weather description language.

Here is a list of possible parameters that are sent as URL querystring:
- lang  
  Default: en  
  Supported languages: ar, bg, ca, cz, de, el, en, fa, fi, fr, gl, hr, hu, it, ja, kr, la, lt, mk, nl, pl, pt, ro, ru, se, sk, sl, es, tr, ua, vi, zh_cn, zh_tw  
  Specify language of weather descriptions.
- units  
  Default: metric  
  Possible values: standard, metric, imperial

Standard units are: Kelvin for temp. and meters/second (m/s) for wind speed
Metric units are: Celsius for temp. and meters/second (m/s) for wind speed
Imperial units are: Fahrenheit for temp. and miles/hour (mph) for wind speed
