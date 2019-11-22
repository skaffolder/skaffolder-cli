var chalk = require('chalk');
var fs = require('fs');
var yaml = require('yaml');

exports.getYaml = function () {
	try {
		let dataYaml = fs.readFileSync('openapi.yaml', "utf-8");

		try {
			fileObj = yaml.parse(dataYaml);

			return fileObj;
		} catch (e) {
			console.info(chalk.red("openapi.yaml file not parsable"));
			process.exit(0);
		}
	} catch (e) {
		console.info(chalk.red("openapi.yaml file not found"));
		process.exit(0);
	}
}