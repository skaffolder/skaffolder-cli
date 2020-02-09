const projectService = require("../service/projectService");
const generate = require("../lib/generate");
const colors = require("colors/safe");
const validator = require("../utils/validator");
const questionService = require("../utils/questionService");
const prompt = require("prompt");
const chalk = require("chalk");
const properties = require("../properties");
const configUtils = require("../utils/config");
const utils = require("../utils/utils");

module.exports = (args, options, logger) => {
  const config = configUtils.getConf();

  // declare lists
  const listYN = [
    {
      description: "Yes",
      value: true
    },
    {
      description: "No",
      value: false
    }
  ];

  const listTypeRel = [
    {
      description: "1 to many",
      value: "1:m"
    },
    {
      description: "many to many",
      value: "m:m"
    }
  ];

  const listType = [
    {
      description: "Relation",
      value: "Relation"
    },
    {
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

  const createModel = function(name, attributes, relations) {
    projectService.getProject(function(err, project) {
      if (err) return;

      const url = utils.slugUrl("/" + name);
      projectService.createModel(name, project._dbs[0], attributes, relations, url, function(err, model) {
        if (err) return;
        generate(null, null, logger, function() {
          logger.info(
            chalk.blue("You can edit your Model at ") +
              chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/models/" + model._id)
          );

          // ask crud
          questionService.ask(
            {
              description: "Do you want to generate CRUD interface for '" + name + "' model?",
              list: listYN
            },
            function(resultCrud) {
              if (resultCrud.value == true) {
                projectService.createCrud(model, function(err, files) {
                  if (err) return;
                  generate(null, null, logger);
                });
              } else {
                process.exit(0);
              }
            }
          );
        });
      });
    });
  };

  // ask model content
  const afterName = function(name) {
    name = utils.slug("/" + name);
    logger.info(chalk.green("Model name: ") + chalk.yellow(name));

    let listModel = [
      {
        description: "No model founds"
      }
    ];

    // get list models
    projectService.getProject(function(err, project) {
      if (err) return;
      projectService.getEntityFindByDb(project._dbs[0], function(err, models) {
        listModel = models.map(item => {
          return {
            description: item.name,
            value: item._id
          };
        });
      });
    });

    // start to ask
    questionService.ask(
      {
        description: "Do you want to add an attiribute to " + name + " model?",
        list: listYN
      },
      function(resultYN) {
        if (!resultYN.value) {
          createModel(name);
        } else {
          // ASK ATTRIBUTES
          let attributes = [];
          let relations = [];

          let askAttribute = function() {
            // ASK NAME
            prompt.get(
              {
                properties: {
                  attributeName: {
                    description: "Insert name of attribute",
                    required: true
                  }
                }
              },
              function(err, result) {
                const attributeName = utils.slug(result.attributeName);
                // ASK TYPE
                questionService.ask(
                  {
                    description: "Select type of " + attributeName + " attribute",
                    list: listType
                  },
                  function(resultType) {
                    if (resultType.value == "Relation") {
                      questionService.ask(
                        {
                          description: "Select model to link",
                          list: listModel
                        },
                        function(resultModel) {
                          questionService.ask(
                            {
                              description: "Select type of relation",
                              list: listTypeRel
                            },
                            function(resultTypeRel) {
                              if (resultModel.value) {
                                relations.push({
                                  _ent2: resultModel.value,
                                  name: attributeName,
                                  type: resultTypeRel.value
                                });
                              }

                              questionService.ask(
                                {
                                  description: "Do you want to add another attiribute to " + name + " model?",
                                  list: listYN
                                },
                                function(resultYN) {
                                  if (resultYN.value) {
                                    askAttribute();
                                  } else {
                                    createModel(name, attributes, relations);
                                  }
                                }
                              );
                            }
                          );
                        }
                      );
                    } else {
                      attributes.push({
                        name: attributeName,
                        type: resultType.value
                      });
                      questionService.ask(
                        {
                          description: "Do you want to add another attiribute to " + name + " model?",
                          list: listYN
                        },
                        function(resultYN) {
                          if (resultYN.value) {
                            askAttribute();
                          } else {
                            createModel(name, attributes, relations);
                          }
                        }
                      );
                    }
                  }
                );
              }
            );
          };
          askAttribute();
        }
      }
    );
  };

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

    // ASK NAME
    prompt.get(
      {
        properties: {
          name: {
            description: "Insert name of your Model",
            required: true
          }
        }
      },
      function(err, result) {
        // ASK ATTRS
        afterName(result.name);
      }
    );
  }
};
