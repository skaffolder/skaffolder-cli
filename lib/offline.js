var offlineService = require("../utils/offlineService")

var pathWorkspace;

var offlineCommandBuilder = (cmd) => {
	return (args, options, logger) => {
		global.OFFLINE = options.offline;
		global.logger = logger;

		cmd(args, options, logger)
	}
}

var _commitYamlProject = (yamlProject) => offlineService.commitYaml(yamlProject, pathWorkspace, global.logger)
var _getYamlProject = () => offlineService.getYaml(pathWorkspace, global.logger)

function pluralize(str) {
	str = str.toLowerCase();
	if (str[str.length - 1] == "s") return str + "es";
	else return str + "s";
}

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

var _findServiceForResAndCrudAction = (yamlPaths, res_id, crudAction) => {
	if (yamlPaths) {
		for (path_name in yamlPaths) {
			var path = yamlPaths[path_name]

			for (method_name in path) {
				var service = path[method_name]

				if (service && service["x-skaffolder-id-resource"] == res_id && service["x-skaffolder-crudAction"] == crudAction) {
					return service
				}
			}
		}
	}

	return null;
}

var _findPageForResAndTemplate = (yamlPages, res_id, template) => {
	if (yamlPages) {
		return yamlPages.find((page) => {
			return page["x-skaffolder-template"] == template && page["x-skaffolder-resource"] == res_id
		})
	}

	return null;
}

var _findModelByEntId = (yamlComponents, ent_id) => {
	var schemas = yamlComponents.schemas;

	if (schemas) {
		for (model_name in schemas) {
			var model = schemas[model_name];

			if (model["x-skaffolder-id-entity"] == ent_id) {
				var model = JSON.parse(JSON.stringify(model));
				model["x-skaffolder-name"] = model_name;

				return model;
			}
		}
	}

	return null
}

var createCrud = (model) => {
	var yamlProject = _getYamlProject();

	if (typeof yamlProject == "undefined") { return {} }

	var _model = _findModelByEntId(yamlProject.components, model["x-skaffolder-id-entity"])
	if (!_model) { return }

	var model_name = _model["x-skaffolder-name"];

	var crud_services = [
		{	
			name: "get",
			url: "/{id}",
			method: "GET",
			_params: [
				{
					name: "id",
					type: "ObjectId",
					description: "Id " + model_name
				}
			]
		},
		{	
			name: "list",
			url: "/",
			method: "GET",
			returnType: "ARRAY OF " + model_name
		},
		{	
			name: "update",
			url: "/{id}",
			method: "POST",
			_params: [
				{
					name: "id",
					type: "ObjectId",
					description: "Id " + model_name
				}
			]
		},
		{	
			name: "delete",
			url: "/{id}",
			method: "DELETE",
			_params: [
				{
					name: "id",
					type: "ObjectId",
					description: "Id " + model_name
				}
			]
		},
		{	
			name: "create",
			url: "/",
			method: "POST"
		}
	]

	var services_ids = {
		edit: [],
		list: []
	};

	var _relations = model["x-skaffolder-relations"]
	if (_relations) {
		for(_rel_name in _relations) {
			var _rel = _relations[_rel_name];

			if (_rel["x-skaffolder-ent1"] == model["x-skaffolder-id-entity"]) {
				var rel_model2 = _findModelByEntId(yamlProject.components, _rel["x-skaffolder-ent2"])
				if (rel_model2) {
					var _service = _findServiceForResAndCrudAction(yamlProject.paths, rel_model2["x-skaffolder-id"], "list")
					if (!_service) {
						_service = {
							_resource: rel_model2["x-skaffolder-id"],
							name: "list",
							url: "/",
							method: "GET",
							returnType: `ARRAY OF ${rel_model2["x-skaffolder-name"]}`,
							crudAction: "list",
							description: "CRUD ACTION LIST",
							_params: [],
							returnType: "",
							_roles: []
						}

						var obj = _createService(yamlProject, _service, rel_model2["x-skaffolder-name"]);
						yamlProject = obj.yamlProject;
						_service = obj._service;
					}
				}

				services_ids.edit.push(_service["x-skaffolder-id"])
			} else if (_rel["x-skaffolder-ent2"] == model["x-skaffolder-id-entity"]) {
				var rel_model1 = _findModelByEntId(yamlProject.components, _rel["x-skaffolder-ent1"])

				if (rel_model1) {
					var service_name = `findBy${_rel_name}`;
					var _service = _findServiceForResAndCrudAction(yamlProject.paths, rel_model1["x-sakffolder-id"], service_name)

					if (!_service) {
						_service = {
							_resource: rel_model1["x-sakffolder-id"],
							name: service_name,
							url: `/${service_name}/{key}`,
							method: "GET",
							description: `CRUD ACTION ${service_name}`,
							returnType: "",
							_roles: [],
							crudAction: service_name,
							_params: [
								{
									name: "key",
									type: "ObjectId",
									description: `Id della risorsa ${_rel_name} da cercare`
								}
							],
						}

						var obj = _createService(yamlProject, _service, rel_model2["x-skaffolder-name"]);
						yamlProject = obj.yamlProject;
						_service = obj._service;
					}

					services_ids.edit.push(_service["x-skaffolder-id"])
				}
			}
		}
	}

	// return;
	crud_services.forEach((service) => {
		var _service = _findServiceForResAndCrudAction(yamlProject.paths, model["x-skaffolder-id"], service.name);

		if (!_service) {
			_service = service
			_service.crudAction = service.name
			_service.description = `CRUD ACTION ${service.crudAction}`
			_service._roles = []
			
			if (!service._params) {
				_service._params = []
			}
			
			if (!service.returnType) {
				_service.returnType = ""
			}

			if (!service._resource) {
				_service._resource = model["x-skaffolder-id"];
			}

			var obj = _createService(yamlProject, _service, model_name);
			yamlProject = obj.yamlProject;
			_service = obj._service;
		}

		switch (_service["x-skaffolder-crudAction"]) {
			case "create": case "update": case "get":
				services_ids.edit.push(_service["x-skaffolder-id"])
				break;
			case "delete": case "list":
				services_ids.list.push(_service["x-skaffolder-id"])
				break;
			default:
				 break;
		}
	})

	const components = yamlProject.components;
	const page_types = ["Edit", "List"]
	var page_edit_id;
	var page_list_id;

	page_types.forEach((page_type) => {
		var oldPage = _findPageForResAndTemplate(components["x-skaffolder-page"], model["x-skaffolder-id"], `${page_type}_Crud`)

		if (!oldPage) {
			let page_name = `${model_name}${page_type}`
			var newPage = {
				"x-skaffolder-id": offlineService.getDummyId(page_name, "page"),
				"x-skaffolder-url": `/${pluralize(model_name)}${page_type == "Edit" ? "/{id}" : ""}`.toLowerCase(),
				"x-skaffolder-name": page_name,
				"x-skaffolder-template": `${page_type}_Crud`,
				"x-skaffolder-resource": model["x-skaffolder-id"],
				"x-skaffolder-roles": []
			}

			newPage["x-skaffolder-services"] = [...services_ids[page_type.toLowerCase()]]
			
			if (page_type == "Edit") {
				page_edit_id = newPage["x-skaffolder-id"]
			} else {
				newPage["x-skaffolder-links"] = [page_edit_id];
				page_list_id = newPage["x-skaffolder-id"]
			}

			if (components) {
				if (!components["x-skaffolder-page"]) {
					components["x-skaffolder-page"] = []
				}
				
				components["x-skaffolder-page"].push(newPage)
			}
		} else {
			var services = oldPage["x-skaffolder-services"] || [];

			services_ids[page_type.toLowerCase()].forEach((_service) => {
				if (services.indexOf(_service) != -1) {
					services.push(_service)
				}
			})

			oldPage["x-skaffolder-services"] = [...services]

			if (page_type == "Edit") {
				page_edit_id = oldPage["x-skaffolder-id"]
			} else {
				if (!oldPage["x-skaffolder-links"]) {
					oldPage["x-skaffolder-links"] = [page_edit_id]
				} else if (oldPage["x-skaffolder-links"].indexOf(page_edit_id) == -1) {
					oldPage["x-skaffolder-links"].push(page_edit_id)
				}

				page_list_id = oldPage["x-skaffolder-id"]
			}

			if (components && components["x-skaffolder-page"]) {
				var index = components["x-skaffolder-page"].reduce((acc, val, i) => { if (val["x-skaffolder-id"] == oldPage["x-skaffolder-id"]) { return i } return acc }, -1);

				if (index != -1) {
					components["x-skaffolder-page"].splice(index, 1, oldPage)
				}
			}
		}
	})

	if (components && components["x-skaffolder-page"]) {
		var homePage = components["x-skaffolder-page"].find((page) => {
			return page["x-skaffolder-name"] && page["x-skaffolder-name"].toLowerCase() == "home"
		})

		if (homePage) {
			if (!homePage["x-skaffolder-links"]) {
				homePage["x-skaffolder-links"] = [page_list_id]
			} else if (homePage["x-skaffolder-links"].indexOf(page_list_id) == -1) {
				homePage["x-skaffolder-links"].push(page_list_id)
			}
			
			var index = components["x-skaffolder-page"].reduce((acc, val, i) => { if (val["x-skaffolder-id"] == homePage["x-skaffolder-id"]) { return i } return acc }, -1);

			if (index != -1) {
				components["x-skaffolder-page"].splice(index, 1, homePage)
			}
		}
	}

	// commit project to openApi.yaml file
	_commitYamlProject(yamlProject, global.logger)
}

var createApi = (service) => {
	var yamlProject = _getYamlProject();

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

	// commit project to openApi.yaml file
	_commitYamlProject(yamlProject, global.logger)

	return _service;
}

var createModel = (model_name, db_id, attributes, relations) => {
	var yamlProject = _getYamlProject();
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

	// commit project to openApi.yaml file
	_commitYamlProject(yamlProject, global.logger)

	return model;
}

var createPage = (name) => {
	var yamlProject = _getYamlProject();

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

	// commit project to openApi.yaml file
	_commitYamlProject(yamlProject, global.logger)

	return page;
}

module.exports.offlineCommandBuilder = offlineCommandBuilder
module.exports.pathWorkspace = pathWorkspace

module.exports.createApi = createApi
module.exports.createCrud = createCrud
module.exports.createModel = createModel
module.exports.createPage = createPage