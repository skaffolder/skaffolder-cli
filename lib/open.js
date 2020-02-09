var projectService = require("../service/projectService");
var questionService = require("../utils/questionService");
var chalk = require("chalk");
var reloadGenerator = require("./reloadGenerator");
var fs = require("fs-extra");
var validator = require("../utils/validator");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (!validator.isLogged()) return;

  if (args.idProject && args.idGenerator) {
    open(args.idProject, args.idGenerator);
  } else {
    askProject();
  }

  async function askProject() {
    // GET PROJECTS
    projectService.getProjectList(async (err, projects) => {
      if (err) return;

      if (projects.length == 0) {
        logger.info(chalk.yellow("You have no projects"));
        process.exit(0);
      }
      projects = projects.map(proj => {
        return {
          title: proj.name,
          value: proj._id
        };
      });

      // SELECT PROJECT
      const selectedProject = await questionService.ask("Select your project", projects);

      // GET GENERATORS
      projectService.getGeneratorList(selectedProject.value, async (err, generators) => {
        if (generators.length == 0) {
          logger.info(chalk.yellow("You have no generator for this projects"));
          process.exit(0);
        }

        generators = generators.map(gen => {
          return {
            title: gen.name,
            value: gen._id
          };
        });

        // SELECT GENERATOR
        const selectedGenerator = await questionService.ask("Select your generator", generators);
        open(selectedProject.value, selectedGenerator.value);
      });
    });
  }

  async function open(idProject, idGenerator) {
    if (fs.existsSync(".skaffolder")) {
      const override = await questionService.askConfirm(
        "A Skaffolder project is present in this folder. Do you want to override it?"
      );

      if (override.value == 1) {
        fs.removeSync(".skaffolder");
        fs.mkdirSync(".skaffolder");

        // CREATE PROJECT
        fs.writeFileSync(
          ".skaffolder/config.json",
          JSON.stringify(
            {
              project: idProject,
              generator: idGenerator
            },
            null,
            4
          )
        );
        reloadGenerator(null, null, logger);
      } else {
        console.log(chalk.yellow("Please run the command in a different folder"));
        process.exit(0);
      }
    } else {
      fs.mkdirSync(".skaffolder");
      // CREATE PROJECT
      fs.writeFileSync(
        ".skaffolder/config.json",
        JSON.stringify(
          {
            project: idProject,
            generator: idGenerator
          },
          null,
          4
        )
      );
      reloadGenerator(null, null, logger);
    }
  }
};
