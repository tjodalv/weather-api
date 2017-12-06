'use strict';

const Responses = {
    success: data => {
        return {
            status: 'ok',
            data
        };
    },

    error: (message, code) => {
        return {
            status: 'error',
            code,
            message
        };
    }
};

module.exports = Responses;