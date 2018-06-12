var cache = require('persistent-cache');
var globals = cache();
var projectService = require('../service/projectService');
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
            }
        }
    };

    // ASK NAME
    prompt.get(schema, function (err, result) {

        // SELECT FRONTEND
        var list = require('select-shell')({
            pointer: ' ▸ ',
            pointerColor: 'yellow',
            checked: ' ◉  ',
            unchecked: ' ◎  ',
            checkedColor: 'blue',
            msgCancel: 'No selected options!',
            msgCancelColor: 'orange',
            multiSelect: false,
            inverse: true,
            prepend: true
        });

        list.option(' One    ')
            .option(' Two    ')
            .option(' Three  ')
            .list();

        list.on('select', function (options) {

            // CREATE PROJECT

            projectService.create(result.name, function (err, project) {
                if (err) {
                    let logger = require("winston-color");
                    return logger.error(err.message);
                }
                logger.info('✔ Project created!');
                logger.info("You can edit your project structure at " + properties.endpoint + "/#!/projects/" + project._id + "/design/models");
                process.exit(0);
            });
        });

    });


}