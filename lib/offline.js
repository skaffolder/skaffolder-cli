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

var createModel = (model_name, db_id, attributes, relations) => {
	var yamlProject = offlineService.getYaml(global.logger);
	var model = {}

	if (typeof yamlProject == "undefined") { return model }

	var model_id_entity = offlineService.getDummyId(model_name, "entity")
	var model_id_resource = offlineService.getDummyId(model_name, "resource")

	var _properties = attributes.reduce((acc, cur) => {
		acc[cur.name] = {
			"type": cur.type.toLowerCase(),
			"x-skaffolder-type": cur.type
		}

		return acc;
	}, {})

	var _relations = relations.reduce((acc, cur) => {
		acc[cur.name] = {
			"x-skaffolder-ent1": model_id_entity,
			"x-skaffolder-ent2": cur._ent2,
			"x-skaffolder-type": cur.type
		}

		return acc;
	}, {})

	model = {
		"x-skaffolder-id": model_id_resource,
		"x-skaffolder-id-db": db_id,
		"x-skaffolder-id-entity": model_id_entity,
		"x-skaffolder-url": `/${ model_name.toLowerCase() }`,
		"properties": _properties,
		"x-skaffolder-relations": _relations,
		"required": [
			"_id"
		]
	}

	if (yamlProject.components && yamlProject.components.schemas) {
		yamlProject.components.schemas[model_name] = model
	}

	// convert yaml project to Skaffolder project
	var skProject = offlineService.translateYamlProject(yamlProject);

	// generate openApi yaml
	offlineService.generateYaml(skProject, global.logger)

	return model;
}

module.exports.offlineCommandBuilder = offlineCommandBuilder
module.exports.createPage = createPage
module.exports.createModel = createModel
