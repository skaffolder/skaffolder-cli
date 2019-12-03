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
				
				if (!_model1._relations) {
					_model1._relations = []
				} 
				_model1._relations.push(_rel)
				
				var _model2 = _entity.find((item) => { return item._id == rel["x-skaffolder-ent2"] })
				if (!_model2._relations) {
					_model2._relations = []
				} 
				_model2._relations.push(Object.assign({}, _rel))
			}
		}
		
		db._entity = _entity
	})

	skProject.dbs = dbs
}

exports.getYaml = getYaml;
exports.translateProject = translateProject