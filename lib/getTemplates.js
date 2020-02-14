const projectService = require("../service/projectService");
const chalk = require("chalk");

module.exports = (templateType) => {
	return (args, option, logger) => {
		projectService.getTemplate((err, templateList) => {
			if (err || !templateList) {
				logger.error(chalk.red("No templates available!"));
				return process.exit(0);
			}

			logger.info(chalk.green("These are all " + chalk.bold(templateType) + " templates available:"));

			templateList.forEach(tmp => {
				if (tmp.type === templateType) {
					logger.info("\t " + tmp.name);
				}
			});
		});
	}
}
