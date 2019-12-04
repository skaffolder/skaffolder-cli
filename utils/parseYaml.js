var chalk = require('chalk');
var fs = require('fs');
var yaml = require('yaml');

var getYaml = function () {
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

var translateProject = function () {
	let yamlProject = getYaml();

	if (typeof yamlProject == "undefined") { process.exit(0) }

	let skProject = {};
	let components = yamlProject.components

	var getPagesArray = function () {
		if (components && components["x-skaffolder-page"]) {
			return components["x-skaffolder-page"].map((item) => { return item["x-skaffolder-id"] }).sort();
		}

		return [];
	}

	var getDBsArray = function () {
		if (components && components["x-skaffolder-db"]) {
			return components["x-skaffolder-db"].map((item) => {
				return {
					_id: item["x-skaffolder-id"],
					name: item["x-skaffolder-name"],
					_owner: "",
					_members: []
				}
			}).sort((a, b) => a._id > b._id);
		}

		return [];
	}

	// project property
	let project = {}
	project._id = yamlProject.info["x-skaffolder-id-project"];
	project._owner = "" 				// not in yaml
	project.name = yamlProject.info.title
	project._members = [] 				// not in yaml
	project._projects = []				// not in yaml
	project._pages = getPagesArray()
	project._dbs = getDBsArray()

	skProject.project = project

	//dbs property
	let dbs = getDBsArray()
	dbs.forEach((db) => {
		// _entity property
		var schemas = components.schemas
		var _entity = [];

		for (let model_name in schemas) {
			var model = schemas[model_name];
			var _model = {}

			if (model["x-skaffolder-id-db"] != db._id) { continue; }

			_model._id = model["x-skaffolder-id-entity"]
			_model._db = model["x-skaffolder-id-db"]
			_model.name = model_name
			_model._attrs = [];
			_model._relations = []

			// entity._attrs property
			for (let attr_name in model.properties) {
				if (attr_name == "_id") { continue }
				var attr = model.properties[attr_name]

				var _attr = {
					_id: attr["x-skaffolder-id-attr"],
					_model: _model._id,
					name: attr_name,
					type: attr["x-skaffolder-type"],
					required: attr["x-skaffolder-required"],
					unique: attr["x-skaffolder-unique"]
				}

				if (attr["x-skaffolder-enumeration"]) {
					_attr._enum = attr["x-skaffolder-enumeration"].map((item) => {
						return {
							name: item,
							_attr: _attr._id
						}
					})
				}

				_model._attrs.push(_attr)
			}

			_entity.push(_model)
		}

		//entity._relations property
		for (let model_name in schemas) {
			var model = schemas[model_name];

			if (model["x-skaffolder-id-db"] != db._id) { continue; }

			for (let rel_name in model["x-skaffolder-relations"]) {
				var rel = model['x-skaffolder-relations'][rel_name];

				var findRelEntity = function (id) {
					return _entity.reduce((acc, item) => {
						if (item._id == id) {
							return {
								_id: item._id,
								name: item.name,
								_db: item._db
							}
						}

						return acc
					}, {})
				}

				var _rel = {
					type: rel["x-skaffolder-type"],
					required: rel["x-skaffolder-required"],
					name: rel_name,
					_ent2: findRelEntity(rel["x-skaffolder-ent2"]),
					_ent1: findRelEntity(rel["x-skaffolder-ent1"])
				}
				var _model1 = _entity.find((item) => { return item._id == model["x-skaffolder-id-entity"] })
				_model1._relations.push(_rel)

				var _model2 = _entity.find((item) => { return item._id == rel["x-skaffolder-ent2"] })
				_model2._relations.push(Object.assign({}, _rel))
			}
		}

		db._entity = _entity
	})

	skProject.dbs = dbs

	// resources property
	let resources = getDBsArray()
	var _resources = []

	resources.forEach((db) => {
		var schemas = components.schemas
		var paths = yamlProject.paths
		var resource_name2id = {}

		var findResEntity = function (id_db, id_entity) {
			var db = skProject.dbs.find((db_item) => { return id_db == db_item._id })

			if (db && db._entity) {
				return db._entity.find((ent_item) => {
					return ent_item._id == id_entity
				})
			}

			return null;
		}

		// create resources
		for (model_name in schemas) {
			var model = schemas[model_name]
			var _resource = {}

			// _resource
			_resource._id = model["x-skaffolder-id"]
			_resource.url = model["x-skaffolder-url"]
			_resource.name = model_name
			_resource._project = project._id
			_resource._db = db._id
			_resource._entity = JSON.parse(JSON.stringify(findResEntity(db._id, model["x-skaffolder-id-entity"])))	// deep clone
			_resource._roles = []

			resource_name2id[_resource.name.toLowerCase()] = _resource._id;

			_resources.push(_resource)
		}

		// resources services
		var res_id2services = {};

		for (let path_name in paths) {
			for (let service_name in paths[path_name]) {
				var service = paths[path_name][service_name];

				if (service['x-skaffolder-ignore']) continue;

				var resource_id = service['x-skaffolder-id-resource'];
				if (service['x-skaffolder-resource'] && resource_name2id[service['x-skaffolder-resource'].toLowerCase()]) {
					resource_id = resource_name2id[service['x-skaffolder-resource'].toLowerCase()];
				}

				var _service = {
					_id: service['x-skaffolder-id'] || 'NONE',
					_resource: resource_id,
					name: service['x-skaffolder-name'],
					url: service['x-skaffolder-url'],
					method: service_name.toUpperCase(),
					description: service['x-skaffolder-description'] || service['summary'],
					returnType: service['x-skaffolder-returnType'] || "",
					crudType: service['x-skaffolder-crudType'] || undefined,
					crudAction: service['x-skaffolder-crudAction'],
					_roles: service['x-skaffolder-roles'],
					returnDesc: service['x-skaffolder-returnDesc'] || undefined,
					_params: []
				}

				
				for (serviceParam_index in service.parameters) {
					var serviceParam = service.parameters[serviceParam_index];
					
					_service._params.push({
						_id: undefined,				// not in yaml
						_service: _service._id,
						name: serviceParam.name,
						type: serviceParam['x-skaffolder-type'] || serviceParam.schema.type,
						description: serviceParam.description
					})
				}
				
				if (!res_id2services[resource_id]) {
					res_id2services[resource_id] = [];
				}
				res_id2services[resource_id].push(_service);
			}
		}

		var findResRelation = function (id_entity) {
			var res = _resources.find((res) => {
				return res._entity._id == id_entity;
			})

			if (res) {
				return {
					_id: res._id,
					url: res.url,
					name: res.name,
					_project: res._project,
					_db: res._db,
					_entity: id_entity,
					_roles: res._roles
				}
			}
		}

		// resources relations and services
		_resources.forEach((res) => {
			var _relations = res._entity._relations;

			_relations.forEach((rel) => {
				rel._ent1._resource = findResRelation(rel._ent1._id)
				rel._ent2._resource = findResRelation(rel._ent2._id)
			})

			res._relations = [...res._entity._relations]

			var _services = res_id2services[res._id]
			_services.sort((a, b) => a.name > b.name)

			res._services = _services
		})
	})

	skProject.resources = _resources;
	// DEBUG: 
	// console.log(JSON.stringify(skProject))
}

exports.getYaml = getYaml;
exports.translateProject = translateProject