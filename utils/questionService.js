const semver = require('semver');


exports.ask = function (options, cb) {


    if (semver.gt(process.version, '8.11.3')) {
        // prompt question
        var select = require('./questionService/init-prompt-question');
        select.start(options, cb);
    } else {

        // intereactive select
        var select = require('./questionService/init-select-shell');
        select.start(options, cb);
    }
}