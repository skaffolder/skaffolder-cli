var offlineService = require("../utils/offlineService")

var offlineCommandBuilder = (cmd) => {
	return (args, options, logger) => {
		global.OFFLINE = options.offline;
		global.logger = logger;

		cmd(args, options, logger)
	}
}

var createPage = (name) => {
	var skProject = offlineService.getProjectData(global.logger);
	if (!skProject) { return }

	let project = skProject.project;
	let modules = skProject.modules;

	var page = {
		_id: offlineService.getDummyId(name, "page"),
		url: `/${name}`,
		name: name,
		left: 6200,
		top: 5100,
		_links: [],
		_nesteds: [],
		_project: project._id,
		_roles: [],
		_services: []
	}

	if (project) {
		if (!project._pages) {
			project._pages = []
		}

		project._pages.push(page._id)
	}

	if (!modules) {
		modules = []
	}
	modules.push(page)
	modules.sort((a, b) => { return a.name > b.name })

	// generate openApi yaml
	offlineService.generateYaml(skProject, global.logger)

	return page;
}

module.exports.offlineCommandBuilder = offlineCommandBuilder
module.exports.createPage = createPage
