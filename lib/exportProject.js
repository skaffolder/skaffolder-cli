var chalk = require('chalk');
var projectService = require('../service/projectService');
var questionService = require('../utils/questionService');
var validator = require('../utils/validator');
var offlineService = require('../utils/offlineService');

module.exports = (args, options, logger) => {
	if (!validator.isSkaffolderFolder()) return;

	let params = {
		skObject: offlineService.getYaml(null, logger),
		outputHtml: false
	}

	var listYN = [{
		description: "Yes",
		value: true
	}, {
		description: "No",
		value: false
	}];

	questionService.ask({
		description: "Do you want to save your project to Skaffolder platform?\nThis will overwrite any model, API and page already present on the platform",
		list: listYN
	}, function (resultOverwrite) {

		if (resultOverwrite.value) {
			projectService.exportProject(params, function (err, logs) {
				if (err) {
					logger.error(chalk.red(err));
				} else {
					logs.forEach(element => {
						if (element.startsWith("[UPDATE]:")) {
							logger.info(chalk.magenta("[UPDATE]:") + element.substring("[UPDATE]:".length))
						} else if (element.startsWith("[CREATE]:")) {
							logger.info(chalk.green("[CREATE]:") + element.substring("[CREATE]:".length))
						} else if (element.startsWith("[ERROR]:")) {
							logger.info(chalk.red("[ERROR]:") + element.substring("[ERROR]:".length))
						} else {
							logger.info(chalk.green(element));
						}
					});
				}
			});
		} else {
			process.exit(0);
		}
	});
}