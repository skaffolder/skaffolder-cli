const projectService = require("../service/projectService");
const questionService = require("../utils/questionService");
const generatorUtils = require("../utils/generator");
const utils = require("../utils/utils");
const properties = require("../properties");
const prompts = require("prompts");
const chalk = require("chalk");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const validator = require("../utils/validator");
const generatorBean = require("../generator/GeneratorBean");
const configUtils = require("../utils/config");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (global.ONLINE) {
    if (!validator.isLogged()) return;
  }

  // ASK NAME
  let nameProject = args.name;
  if (!nameProject) {
    const response = await prompts({
      type: "text",
      name: "name",
      validate: res => !!res,
      message: "Insert the name of your project"
    });
    nameProject = response.name;
  }

  // SLUG NAME
  nameProject = utils.slug(nameProject);
  logger.info(chalk.green("Project name:\t\t") + chalk.yellow(nameProject));

  // GET TEMPLATES
  projectService.getTemplate(async (err, template) => {
    if (!template) {
      logger.error(chalk.red("No templates available!"));
      return process.exit(0);
    }

    let listFrontend = [];
    let listBackend = [];

    template.filter(temp => {
      if (temp.type == "frontend") {
        listFrontend.push({
          title: temp.name,
          description: temp.description,
          value: temp._id
        });
      } else if (temp.type == "backend") {
        listBackend.push({
          title: temp.name,
          description: temp.description,
          value: temp._id
        });
      }
    });

    listFrontend.push({
      title: "NONE",
      value: null
    });
    listBackend.push({
      title: "NONE",
      value: null
    });

    // SELECT FRONTEND
    let resultFrontend = {};
    if (options.frontend) {
      listFrontend.filter(front => {
        if (front.title == options.frontend) {
          resultFrontend = front;
        }
      });
      if (!resultFrontend.title) {
        logger.info("The possible values for a frontend template are:");
        listFrontend.filter(front => {
          logger.info("\t" + front.title);
        });
        return;
      } else {
        logger.info(chalk.green("Frontend template:\t") + chalk.yellow(resultFrontend.title));
      }
    } else {
      resultFrontend = await questionService.ask("Select your frontend language", listFrontend);
      if (resultFrontend.value === undefined) return;
    }

    // SELECT BACKEND
    let resultBackend = {};
    if (options.backend) {
      listBackend.filter(back => {
        if (back.title == options.backend) {
          resultBackend = back;
        }
      });
      if (!resultBackend.title) {
        logger.info("The possible values for a backend template are:");
        listBackend.filter(back => {
          logger.info("\t" + back.title);
        });
        return;
      } else {
        logger.info(chalk.green("Backend template:\t") + chalk.yellow(resultBackend.title));
      }
    } else {
      resultBackend = await questionService.ask("Select your backend language", listBackend);
      if (resultBackend.value === undefined) return;
    }

    // IMPORT
    let importFile;
    if (options.import == true) {
      importFile = "openapi.yaml";
    } else if (options.import) {
      importFile = options.import;
    }

    // CREATE PROJECT
    if (global.ONLINE) {
      projectService.create(nameProject, function(err, project) {
        if (err) {
          return process.exit(0);
        }

        try {
          mkdirp.sync("./.skaffolder/template");
        } catch (e) {}
        fs.writeFileSync(
          "./.skaffolder/config.json",
          JSON.stringify(
            {
              project: project._id
            },
            null,
            4
          )
        );

        logger.info(chalk.green("\n\n✔   Online Project created!"));
        logger.info(
          chalk.blue("You can edit your project structure at ") +
            chalk.yellow(properties.endpoint + "/#!/projects/" + project._id + "/models") +
            chalk.blue(" or running ") +
            chalk.yellow("'sk web open'")
        );

        // CREATE TEMPLATE
        projectService.createFromTemplate(project._id, resultFrontend.value, resultBackend.value, function(err, generator) {
          fs.writeFileSync(
            ".skaffolder/config.json",
            JSON.stringify(
              {
                project: project._id,
                generator: generator._id
              },
              null,
              4
            )
          );
          generatorUtils.loadGenerator(project._id, generator._id, () => {
            printLabel(logger);
            var config = configUtils.getConf();
            logger.info(
              chalk.blue("You can edit your project structure at ") +
                chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/models\n") +
                chalk.blue(" or running ") +
                chalk.yellow("'sk web open'")
            );
          });
        });
      });
    } else {
      fs.removeSync(".skaffolder/template");

      // CREATE TEMPLATE
      generatorUtils.loadTemplateFiles(resultFrontend.value, resultBackend.value, async () => {
        const data = generatorUtils.getEmptyProjectData(nameProject);
        // CREATE OPENAPI FILE
        var utils = require("../generator/GeneratorUtils");
        utils.init("./", data.project, data.modules, data.resources, data.dbs, data.roles);

        // Generate file
        logger.info("\n\n");
        let fileTemplate = generatorBean.parseTemplateFile(".skaffolder/template/", ".skaffolder/template/openapi.yaml.hbs");
        generatorBean.generateFile(fileTemplate, [], utils, data.project, data.modules, data.resources, data.dbs);

        // Import data
        if (importFile) {
          logger.info("Import from OpenAPI 3.0 file: " + chalk.yellow(importFile));
          await generatorUtils.importOpenAPI(importFile, nameProject);
        }

        printLabel(logger);
      });
    }
  });
};

const printLabel = logger => {
  // prettier-ignore
  logger.info(`
    _____ _   ` + chalk.hex("#FF6C36")("__") + `      __  __      _     _            ` + chalk.hex("#FF6C36")("__") + `                _____ _      _____   
   / ____| | ` + chalk.hex("#FF6C36")("/ /") + `     / _|/ _|    | |   | |           ` + chalk.hex("#FF6C36")("\\ \\") + `              / ____| |    |_   _|  
  | (___ | |` + chalk.hex("#FF6C36")("/ /") + ` __ _| |_| |_ ___ | | __| | ___ _ __   ` + chalk.hex("#FF6C36")("\\ \\") + `    ______  | |    | |      | |    
   \\___ \\| ` + chalk.hex("#FF6C36")("{ {") + ` / _\` |  _|  _/ _ \\| |/ _\` |/ _ \\ '__|   ` + chalk.hex("#FF6C36")("} }") + `  |______| | |    | |      | |    
   ____) | |` + chalk.hex("#FF6C36")("\\ \\") + ` (_| | | | || (_) | | (_| |  __/ |     ` + chalk.hex("#FF6C36")("/ /") + `            | |____| |____ _| |_   
  |_____/|_| ` + chalk.hex("#FF6C36")("\\_\\") + `__,_|_| |_| \\___/|_|\\__,_|\\___|_|    ` + chalk.hex("#FF6C36")("/_/") + `              \\_____|______|_____|  
                                                                                            

`);
  logger.info(chalk.green("✔   Project created offline!\n"));
  logger.info(
    chalk.white("You can edit the project from the ") +
      chalk.yellow("web interface") +
      chalk.white(" running ") +
      chalk.green("'sk export'")
  );
  logger.info(
    chalk.white("You can edit the project from the ") +
      chalk.yellow("VSCode extension") +
      chalk.green(" https://github.com/skaffolder/skaffolder-vscode-extension")
  );
  logger.info(chalk.white("You can edit the project from the ") + chalk.green("openapi.yaml") + chalk.yellow(" file"));
  logger.info(chalk.white("You can edit the project from the ") + chalk.yellow("command line") + chalk.white(":"));
  logger.info(chalk.white("\tAdd a model running ") + chalk.green("'sk add model'"));
  logger.info(chalk.white("\tAdd a page running ") + chalk.green("'sk add page'"));
  logger.info(chalk.white("\tAdd an API running ") + chalk.green("'sk add api'"));
  logger.info(chalk.yellow("\nGenerate your code running ") + chalk.green("'sk generate'\n"));
};
