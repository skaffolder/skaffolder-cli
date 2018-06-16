var projectService = require('../service/projectService');
var generate = require('../lib/generate');
var colors = require("colors/safe");
var validator = require('../utils/validator');
var questionService = require('../utils/questionService');
var prompt = require('prompt');

module.exports = (args, options, logger) => {

    var listYN = [{
        description: "Yes",
        value: true
    }, {
        description: "No",
        value: false
    }];

    var listType = [{
            description: "String",
            value: "String"
        },
        {
            description: "Number",
            value: "Number"
        },
        {
            description: "Date",
            value: "Date"
        },
        {
            description: "Boolean",
            value: "Boolean"
        },
        {
            description: "Integer",
            value: "Integer"
        },
        {
            description: "Decimal",
            value: "Decimal"
        }
    ];

    // ---- CREATE MODEL ---- 

    var createModel = function (name, attributes) {
        projectService.getProject(function (err, project) {
            if (err) return;

            projectService.createModel(name, project._dbs[0], attributes, function (err, files) {
                if (err) return;
                generate(null, null, logger);
            });
        })
    };
    var afterName = function (name) {
        questionService.ask({
            description: "Do you want to add an attiribute to " + name + " model?",
            list: listYN
        }, function (resultYN) {
            if (!resultYN.value) {
                createModel(name);
            } else  {
                // ASK ATTRIBUTES
                let attributes = [];
                let askAttribute = function () {

                    var schema2 = {
                        properties: {
                            attribute: {
                                description: 'Insert name of attribute',
                                required: true
                            },
                        }
                    };

                    // ASK NAME
                    prompt.get(schema2, function (err, result) {


                        // ASK TYPE
                        /*
                        questionService.ask({
                            description: "Select type of " + result.name + " attribute",
                            list: listType
                        }, function (resultType) {

                            attributes.push({
                                name: result.name,
                                type: resultType.value
                            })
                            questionService.ask({
                                description: "Do you want to add another attiribute to " + name + " model?",
                                list: listYN
                            }, function (resultYN) {
                                if (resultYN.value) {
                                    askAttribute();
                                } else {
                                    createModel(name, attributes);
                                }
                            });
                        });
*/
                    });

                }
                askAttribute();

            }
        });
    }

    // ---- INIT ---- 

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    if (args.name) {
        // ASK ATTRS
        afterName(args.name);
    } else {

        // INIT PROMPT
        prompt.message = colors.green("Skaffolder");
        prompt.start();

        var schema = {
            properties: {
                name: {
                    description: 'Insert name of your Model',
                    required: true
                },
            }
        };

        // ASK NAME
        prompt.get(schema, function (err, result) {

            // ASK ATTRS
            afterName(result.name);
        });

    }

}