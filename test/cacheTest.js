const expect = require('chai').expect;
const cache  = require('../src/cache');

describe('Cache', function () {
    describe('#set() and #get()', function () {
        it('should add item in cache and retrieve it', () => {
            cache.set('test', 5, 1);
            expect(cache.get('test')).to.equal(5);
        });

        it('cache item should expire in 1 seconds', done => {
            cache.set('test1', 'abc', 1);
            setTimeout(() => {
                expect(cache.get('test1')).to.be.null;
                done();
            }, 1500);
        });
    });

    describe('#find()', function () {
        it('should find and retrieve item from cache', () => {
            cache.set('test2', 'abc', 2);
            let item = cache.find('test2');

            expect(item).to.haveOwnProperty('name');
            expect(item).to.haveOwnProperty('value');
            expect(item).to.haveOwnProperty('expires');
        });

        it('should check cache expire if expire param is date object', function () {
            let expires = new Date();
            expires.setTime(expires.getTime() + 60*1000);

            cache.set('test3', 'abc', expires);
            let item = cache.find('test3');

            expect(item).to.haveOwnProperty('name', 'test3');
            expect(item).to.haveOwnProperty('value', 'abc');
            expect(item).to.haveOwnProperty('expires', expires);
        });
    });

    describe('#items()', function () {
        it('should return cached items array', function () {
            cache.purge();
            cache.set('test4', 'abc', 5);
            let items = cache.items();

            expect(items).to.be.an('array').lengthOf(1);
        });
    });

    describe('#remove()', function () {
        it('should remove item from cache collection', function () {
            cache.purge();
            cache.set('test5', 1234, 5);
            cache.set('test6', 'abcd', 5);

            let items = cache.items();
            expect(items).to.be.an('array').lengthOf(2);

            let item = cache.find('test5');
            cache.remove(item);

            items = cache.items();
            expect(items).to.be.an('array').lengthOf(1);
        });
    });
});