const projectService = require("../service/projectService");
const questionService = require("../utils/questionService");
const generatorUtils = require("../utils/generator");
const utils = require("../utils/utils");
const generate = require("../lib/generate");
const properties = require("../properties");
const prompts = require("prompts");
const chalk = require("chalk");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const validator = require("../utils/validator");
const generatorBean = require("../generator/generatorBean");

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
  logger.info(chalk.green("Project name: ") + chalk.yellow(nameProject));

  // GET TEMPLATES
  projectService.getTemplate(async (err, template) => {
    if (!template) {
      logger.error(chalk.red("No tempaltes available!"));
      return process.exit(0);
    }

    let listFrontend = [];
    let listBackend = [];

    template.filter(temp => {
      if (temp.type == "frontend") {
        listFrontend.push({
          title: temp.name,
          value: temp._id
        });
      } else if (temp.type == "backend") {
        listBackend.push({
          title: temp.name,
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
    const resultFrontend = await questionService.ask("Select your frontend language", listFrontend);
    // SELECT BACKEND
    const resultBackend = await questionService.ask("Select your backend language", listBackend);

    if (!global.OFFLINE) {
      // CREATE PROJECT
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

        logger.info(chalk.green("✔   Project created!"));
        logger.info(
          chalk.blue("You can edit your project structure at ") +
            chalk.yellow(properties.endpoint + "/#!/projects/" + project._id + "/design/models")
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
            logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));

            generate(null, null, logger);
          });
        });
      });
    } else {
      fs.removeSync(".skaffolder/template");

      // CREATE TEMPLATE
      generatorUtils.loadTemplateFiles(resultFrontend.value, resultBackend.value, () => {
        // CREATE OPENAPI FILE

        var utils = require("../generator/GeneratorUtils");

        var data = {
          project: {
            name: nameProject
          },
          modules: [
            {
              name: "Home",
              url: "/home",
              _roles: []
            }
          ],
          resources: [
            {
              name: nameProject + "_db",
              _resources: [
                {
                  url: "/user",
                  type: "User",
                  name: "User",
                  _relations: [],
                  _entity: {
                    type: "User",
                    name: "User",
                    _relations: [],
                    _attrs: [
                      {
                        name: "mail",
                        type: "String"
                      },
                      {
                        name: "name",
                        type: "String"
                      },
                      {
                        name: "password",
                        required: true,
                        type: "String"
                      },
                      {
                        name: "roles",
                        type: "String"
                      },
                      {
                        name: "surname",
                        type: "String"
                      },
                      {
                        name: "username",
                        required: true,
                        type: "String"
                      }
                    ]
                  },
                  _services: [
                    {
                      name: "changePassword",
                      url: "/{id}/changePassword",
                      method: "POST",
                      description: "Change password of user from admin",
                      returnType: "object",
                      _roles: [
                        {
                          _id: "ADMIN"
                        }
                      ]
                    },
                    {
                      name: "create",
                      url: "/",
                      method: "POST",
                      description: "CRUD ACTION create",
                      returnType: "",
                      crudAction: "create",
                      _roles: []
                    },
                    {
                      name: "delete",
                      url: "/{id}",
                      method: "DELETE",
                      description: "CRUD ACTION delete",
                      returnType: "",
                      crudAction: "delete",
                      _roles: [],
                      _params: [
                        {
                          name: "id",
                          type: "ObjectId",
                          description: "Id"
                        }
                      ]
                    },
                    {
                      _id: "5e3f47537183501c622c34e4",
                      _resource: "5e3f47537183501c622c34df",
                      name: "get",
                      url: "/{id}",
                      method: "GET",
                      description: "CRUD ACTION get",
                      returnType: "",
                      crudAction: "get",
                      _roles: [],
                      __v: 0,
                      _params: [
                        {
                          _id: "5e3f47537183501c622c34ea",
                          _service: "5e3f47537183501c622c34e4",
                          name: "id",
                          type: "ObjectId",
                          description: "Id resource",
                          __v: 0
                        }
                      ]
                    },
                    {
                      name: "list",
                      url: "/",
                      method: "GET",
                      description: "CRUD ACTION list",
                      returnType: "",
                      crudAction: "list",
                      _roles: []
                    },
                    {
                      name: "update",
                      url: "/{id}",
                      method: "POST",
                      description: "CRUD ACTION update",
                      returnType: "",
                      crudAction: "update",
                      _roles: [],
                      _params: [
                        {
                          name: "id",
                          type: "ObjectId",
                          description: "Id"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          roles: [
            {
              _id: "ADMIN",
              name: "ADMIN"
            }
          ]
        };

        utils.init("./", data.project, data.modules, data.resources, data.dbs, data.roles);

        // Generate file

        let fileTempalte = generatorBean.parseTemplateFile(".skaffolder/template/", ".skaffolder/template/openapi.yaml.hbs");
        generatorBean.generateFile(fileTempalte, [], utils, data.project, data.modules, data.resources, data.dbs);

        logger.info(`
        _____ _          __  __      _     _
       / ____| |        / _|/ _|    | |   | |
      | (___ | | ____ _| |_| |_ ___ | | __| | ___ _ __
       \\___ \\| |/ / _\` |  _|  _/ _ \\| |/ _\` |/ _ \\ '__|
       ____) |   < (_| | | | || (_) | | (_| |  __/ |
      |_____/|_|\\_\\__,_|_| |_| \\___/|_|\\__,_|\\___|_|

                 `);
        logger.info(chalk.green("✔   Project created offline!\n"));
        logger.info(
          chalk.white("You can edit the project the project from the ") +
            chalk.yellow("web interface") +
            chalk.white(" running ") +
            chalk.green("'sk export'")
        );
        logger.info(
          chalk.white("You can edit the project the project from the ") +
            chalk.yellow("VSCode extension") +
            chalk.green(" https://github.com/skaffolder/skaffolder-vscode-extension")
        );
        logger.info(
          chalk.white("You can edit the project the project from the ") + chalk.green("openapi.yaml") + chalk.yellow(" file")
        );
        logger.info(
          chalk.white("You can edit the project the project from the ") + chalk.yellow("command line") + chalk.white(":")
        );

        logger.info(chalk.white("\tAdd a model running ") + chalk.green("'sk add model'"));
        logger.info(chalk.white("\tAdd a page running ") + chalk.green("'sk add page'"));
        logger.info(chalk.white("\tAdd an API running ") + chalk.green("'sk add api'"));

        logger.info(chalk.yellow("\nGenerate your code running ") + chalk.green("'sk generate'"));
      });
    }
  });
};
