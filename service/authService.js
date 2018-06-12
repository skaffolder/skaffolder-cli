var properties = require('../properties');
var request = require('request');
var md5 = require('md5');

exports.login = function (mail, password, cb) {

    request({
        url: properties.endpoint + "/cli/login",
        method: "GET",
        headers: {
            'user': mail,
            'pass': md5(password),
        }
    }, function (error, response, body) {
        cb(error, JSON.parse(body));
    });

}