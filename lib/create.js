var projectService = require('../service/projectService');
var questionService = require('../utils/questionService');
var properties = require('../properties');
var prompt = require('prompt');
var colors = require("colors/safe");

module.exports = (args, options, logger) => {

    prompt.message = colors.green("Skaffolder");
    prompt.start();

    var schema = {
        properties: {
            name: {
                description: 'Insert name of your project',
                required: true
            },
        }
    };

    // ASK NAME
    prompt.get(schema, function (err, result) {

        // SELECT FRONTEND
        questionService.ask({
            description: "Select your frontend language",
            list: [{
                    description: "AngularJS",
                    value: "angularjs_id"
                },
                {
                    description: "Angular4",
                    value: "angular4_id"
                }
            ]
        }, function (result) {

            // CREATE PROJECT
            projectService.create(result.name, function (err, project) {
                if (err) {
                    process.exit(0);
                }
                logger.info('✔ Project created!');
                logger.info("You can edit your project structure at " + properties.endpoint + "/#!/projects/" + project._id + "/design/models");
                process.exit(0);
            });

        });
    });


}