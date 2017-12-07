'use strict';

const qs = require('querystring');
const url = require('url');
const crypto = require('crypto');

// Array that holds all cached items
const Items = [];

const Cache = {
    /*
     * Get cache collection
     * @return array  Collection of cached items
     */
    items: () => {
        return [...Items];
    },

    /*
     * Get item from cache specified by item name
     *  @param  string  Cache item name
     *  @return mixed   Whatever value you have put into cache collection
     */
    get: (name) => {
        let item = Cache.find(name);

        if (item) {
            // Check if cache is stale
            let now = new Date();
            if (item.expires.getTime() < now.getTime()) {
                Cache.remove(item);
                return null;
            }
            return item.value;
        }
        return null;
    },

    /*
     * Add new item to cache collection
     *  @param  string    Unique cache item name
     *  @param  mixed     Value that you are trying to store into cache
     *  @param  int|Date  Number of seconds or date object when item should expire
     *  @return void
     */
    set: (name, value, expires) => {
        let expireSeconds = Number(expires);
        let expiresDate = (Object.prototype.toString.call(expires) === '[object Date]') ?
                            expires : null;

        if (!expiresDate) {
            if (isNaN(expireSeconds)) {
                // default cache duration is 30 seconds
                expireSeconds = 30;
            }
            expiresDate = new Date();
            expiresDate.setSeconds(expiresDate.getSeconds() + expireSeconds);
        }

        // remove old item from cache if exists
        let item = Cache.find(name);
        if (item) Cache.remove(item);

        // create new cache item
        item = Cache.make(name, value, expiresDate);
        Items.push(item);

        //console.log(JSON.stringify(Items));
    },

    /*
     * Create new cache item
     *  @param  string  Cache item's name
     *  @param  mixed   Cached value
     *  @param  Date|Int    Integer values are seconds
     *  @return Object
     */
    make: (name, value, expires) => {
        let CacheItem = {
            name,
            value,
            expires
        };
        return CacheItem;
    },

    /*
     * Find item in cache collection
     *  @param  string  Cache item name
     *  @return object  CacheItem object
     */
    find: (name) => {
        let item = Items.filter((obj) => {
            return obj.name === name;
        });
        return (item.length > 0) ? item[0] : null;
    },

    /*
     * Removes item from cache collection if it finds it
     *  @param  object  CacheItem object
     *  @return void
     */
    remove: (item) => {
        let index = Items.indexOf(item);
        Items.splice(index, 1);
    },

    /*
     * Helper function for producing hash from provided url. It is a helper
     * for creating cache item names when caching third-party API responses.
     *  @param  string         URL to some API service
     *  @param  string|object  Query string params
     */
    hashUrl: (strUrl) => {
        let objUrl   = url.parse(strUrl);
        let baseUrl  = objUrl.protocol + '//'+ objUrl.host + objUrl.pathname;
        let objQuery = qs.parse(objUrl.query);

        strUrl = baseUrl +'?'+ Object.keys(objQuery).sort().map(key => {
            return key +'='+ objQuery[key];
        }).join('&');

        strUrl = String(strUrl).toLowerCase();

        let hash = crypto.createHash('sha256');
        hash.update(strUrl);

        // Return url hash
        return hash.digest('hex');
    },

    purge: () => {
        Items.length = 0;
    }
}

module.exports = Cache;