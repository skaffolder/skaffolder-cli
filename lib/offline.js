var offlineService = require("../utils/offlineService")

var offlineCommandBuilder = (cmd) => {
	return (args, options, logger) => {
		global.OFFLINE = options.offline;
		global.logger = logger;

		cmd(args, options, logger)
	}
}

var createApi = (service) => {
	var yamlProject = offlineService.getYaml(global.logger);

var _createService = (yamlProject, service, model_name) => {
	var paths = yamlProject.paths

	if (paths) {
		var url = service.url.startsWith("/") ? service.url : `/${service.url}`
		var serviceFullName = `/${model_name}${url}`.toLowerCase()

		if (!paths[serviceFullName]) {
			paths[serviceFullName] = {}
		}

		var _service = {
			"x-skaffolder-id": offlineService.getDummyId(`${service.name || service.method }_${model_name}`, "service"),
			"x-skaffolder-id-resource": service._resource,
			"x-skaffolder-name": service.name,
			"x-skaffolder-crudAction": service.crudAction,
			"x-skaffolder-url": url,
			"x-skaffolder-description": service.description || `${service.name} ${service.method}`,
			"x-skaffolder-roles": service._roles,
			"x-skaffolder-returnType": service.returnType,
		}

		if (service._params) {
			_service.parameters = service._params.map((param) => {
				return {
					"name": param.name,
					"x-skaffolder-type": param.type,
					"description": param.description
				}
			})
		}

		paths[serviceFullName][service.method.toLowerCase()] = _service
	}

	return { _service: _service, yamlProject: yamlProject };
}
var createApi = (service) => {
	var yamlProject = offlineService.getYaml(global.logger);

	if (typeof yamlProject == "undefined") { return {} }

	var skProject = offlineService.translateYamlProject(yamlProject);
	var model_name = ""

	if (skProject.resources) {
		var _res;

		skProject.resources.forEach((db) => {
			_res = db._resources.find((item) => {
				return item._id == service._resource
			})
		})

		if (_res) {
			model_name = _res.name
		}
	}

	var obj = _createService(yamlProject, service, model_name);
	var _service = obj._service;
	yamlProject = obj.yamlProject;

	// convert yaml project to Skaffolder project
	skProject = offlineService.translateYamlProject(yamlProject);

	// generate openApi yaml
	offlineService.generateYaml(skProject, global.logger)

	return _service;
}

var createModel = (model_name, db_id, attributes, relations) => {
	var yamlProject = offlineService.getYaml(global.logger);
	var model = {}

	if (typeof yamlProject == "undefined") { return model }

	var model_id_entity = offlineService.getDummyId(model_name, "entity")
	var model_id_resource = offlineService.getDummyId(model_name, "resource")

	var _properties;
	if (attributes) {
		_properties = attributes.reduce((acc, cur) => {
			acc[cur.name] = {
				"type": cur.type.toLowerCase(),
				"x-skaffolder-type": cur.type
			}

			return acc;
		}, {})
	}

	var _relations
	if (relations) {
		_relations = relations.reduce((acc, cur) => {
			acc[cur.name] = {
				"x-skaffolder-ent1": model_id_entity,
				"x-skaffolder-ent2": cur._ent2,
				"x-skaffolder-type": cur.type
			}

			return acc;
		}, {})
	}

	model = {
		"x-skaffolder-id": model_id_resource,
		"x-skaffolder-id-db": db_id,
		"x-skaffolder-id-entity": model_id_entity,
		"x-skaffolder-url": `/${model_name.toLowerCase()}`,
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

var createPage = (name) => {
	var yamlProject = offlineService.getYaml(global.logger);

	if (typeof yamlProject == "undefined") { return {} }

	var page = {
		"x-skaffolder-id": offlineService.getDummyId(name, "page"),
		"x-skaffolder-url": `/${name}`.toLowerCase(),
		"x-skaffolder-name": name
	}

	if (yamlProject.components) {
		if (!yamlProject.components["x-skaffolder-page"]) {
			yamlProject.components["x-skaffolder-page"] = []
		}

		yamlProject.components["x-skaffolder-page"].push(page)
	}

	// convert yaml project to Skaffolder project
	var skProject = offlineService.translateYamlProject(yamlProject);

	// generate openApi yaml
	offlineService.generateYaml(skProject, global.logger)

	return page;
}

module.exports.offlineCommandBuilder = offlineCommandBuilder

module.exports.createApi = createApi
module.exports.createModel = createModel
module.exports.createPage = createPage
