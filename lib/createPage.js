var projectService = require('../service/projectService');
var generate = require('../lib/generate');
var prompt = require('prompt');
var colors = require("colors/safe");
var validator = require('../utils/validator');

module.exports = (args, options, logger) => {

    // ---- CREATE PAGE ---- 

    var createPage = function (name) {
        projectService.createPage(name, function (err, files) {
            if (err) return;

            generate(null, null, logger);
        });
    };

    // ---- INIT ---- 

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    if (args.name) {
        // CREATE PAGE
        createPage(args.name);
    } else {

        // INIT PROMPT
        prompt.message = colors.green("Skaffolder");
        prompt.start();

        var schema = {
            properties: {
                name: {
                    description: 'Insert name of your page',
                    required: true
                },
            }
        };

        // ASK NAME
        prompt.get(schema, function (err, result) {

            // CREATE PAGE
            createPage(result.name);
        });
    }

}