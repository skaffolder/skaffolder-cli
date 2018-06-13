var cache = require('persistent-cache');
var globals = cache();
var colors = require("colors/safe");
var authService = require('../service/authService');
var prompt = require('prompt');


module.exports = (args, options, logger) => {
    globals.putSync("token", null);

    logger.info("✔ Logout succesfully")
}