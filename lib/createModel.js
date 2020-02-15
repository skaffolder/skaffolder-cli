const projectService = require("../service/projectService");
const generate = require("../lib/generate");
const validator = require("../utils/validator");
const questionService = require("../utils/questionService");
const prompts = require("prompts");
const chalk = require("chalk");
const properties = require("../properties");
const configUtils = require("../utils/config");
const utils = require("../utils/utils");

module.exports = async (args, options, logger) => {
  const config = configUtils.getConf();

  // declare lists

  const listTypeRel = [
    {
      title: "1 to many",
      value: "1:m"
    },
    {
      title: "many to many",
      value: "m:m"
    }
  ];

  const listType = [
    {
      title: "Relation",
      value: "Relation"
    },
    {
      title: "String",
      value: "String"
    },
    {
      title: "Number",
      value: "Number"
    },
    {
      title: "Date",
      value: "Date"
    },
    {
      title: "Boolean",
      value: "Boolean"
    },
    {
      title: "Integer",
      value: "Integer"
    },
    {
      title: "Decimal",
      value: "Decimal"
    }
  ];

  // ---- CREATE MODEL ----

  const createModel = async function(name, attributes, relations) {
    projectService.getProject(function(err, project) {
      if (err) return;

      const url = utils.slugUrl("/" + name);
      projectService.createModel(name, project._dbs[0], attributes, relations, url, function(err, model) {
        if (err) return;
        generate(null, null, logger, async function() {
          logger.info(
            chalk.blue("You can edit your Model at ") +
              chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/models/" + model._id)
          );

          // ask crud
          const resultCrud = await questionService.askConfirm("Do you want to generate CRUD interface for '" + name + "' model?");
          if (resultCrud.value == true) {
            projectService.createCrud(model, function(err, files) {
              if (err) return;
              generate(null, null, logger);
            });
          } else {
            process.exit(0);
          }
        });
      });
    });
  };

  // ask model content
  const afterName = async function(name) {
    name = utils.slug("/" + name);
    logger.info(chalk.green("Model name: ") + chalk.yellow(name));

    let listModel = [
      {
        title: "No model founds"
      }
    ];

    // get list models
    projectService.getProject(async function(err, project) {
      if (err) return;
      projectService.getEntityFindByDb(project._dbs[0], function(err, models) {
        listModel = models.map(item => {
          return {
            title: item.name,
            value: item._id
          };
        });
      });
    });

    // start to ask
    const resultYN = await questionService.askConfirm("Do you want to add an attribute to " + name + " model?");
    if (!resultYN.value) {
      createModel(name);
    } else {
      // ASK ATTRIBUTES
      let attributes = [];
      let relations = [];

      let askAttribute = async function() {
        // ASK NAME
        const responseAttr = await prompts({
          type: "text",
          name: "name",
          validate: res => !!res,
          message: "Insert the name of the attribute"
        });
        const attributeName = utils.slug(responseAttr.name);
        // ASK TYPE
        const resultType = await questionService.ask("Select type of " + attributeName + " attribute", listType);
        if (resultType.value == "Relation") {
          const resultModel = await questionService.ask("Select model to link", listModel);
          const resultTypeRel = await questionService.ask("Select type of relation", listTypeRel);
          if (resultModel.value) {
            relations.push({
              _ent2: resultModel.value,
              name: attributeName,
              type: resultTypeRel.value
            });
          }

          const resultYN = await questionService.askConfirm("Do you want to add another attribute to " + name + " model?");
          if (resultYN.value) {
            askAttribute();
          } else {
            createModel(name, attributes, relations);
          }
        } else {
          attributes.push({
            name: attributeName,
            type: resultType.value
          });
          const resultYN = await questionService.askConfirm("Do you want to add another attribute to " + name + " model?");
          if (resultYN.value) {
            askAttribute();
          } else {
            createModel(name, attributes, relations);
          }
        }
      };
      askAttribute();
    }
  };

  // ---- INIT ----

  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;
  if (global.ONLINE && !validator.isSkaffolderProject()) return;

  if (args.name) {
    // ASK ATTRS
    afterName(args.name);
  } else {
    // ASK NAME
    const responseModel = await prompts({
      type: "text",
      name: "name",
      validate: res => !!res,
      message: "Insert the name of your model"
    });
    const modelName = utils.slug(responseModel.name);

    afterName(modelName);
  }
};
