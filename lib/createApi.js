const projectService = require("../service/projectService");
const generate = require("../lib/generate");
const questionService = require("../utils/questionService");
const validator = require("../utils/validator");
const chalk = require("chalk");
const properties = require("../properties");
const configUtils = require("../utils/config");
const utils = require("../utils/utils");
const prompts = require("prompts");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  let listMethods = [
    {
      title: "GET",
      value: "GET"
    },
    {
      title: "POST",
      value: "POST"
    },
    {
      title: "DELETE",
      value: "DELETE"
    },
    {
      title: "PATCH",
      value: "PATCH"
    },
    {
      title: "PUT",
      value: "PUT"
    },
    {
      title: "OPTIONS",
      value: "OPTIONS"
    }
  ];

  let listType = [
    {
      title: "Custom API",
      value: "custom"
    },
    {
      title: "get",
      value: "get"
    },
    {
      title: "update",
      value: "update"
    },
    {
      title: "create",
      value: "create"
    },
    {
      title: "list",
      value: "list"
    },
    {
      title: "delete",
      value: "delete"
    }
  ];

  projectService.getModelsList(async function(err, models) {
    // SELECT MODEL API
    let listModels = models.map(model => {
      return {
        title: model.name,
        value: model._id
      };
    });
    const resultModel = await questionService.ask("Select the model on which you want to create the API", listModels);
    let model = {};
    models.filter(item => {
      if (item._id == resultModel.value) {
        model = item;
      }
    });

    // ASK TYPE
    listType = listType.filter(value => {
      for (let i in model._resource._services) {
        let serv = model._resource._services[i];
        if (serv.crudAction == value.value) return false;
      }
      return true;
    });
    const resultType = await questionService.ask("Select type of your API", listType);
    if (resultType.value == "custom") {
      // ASK NAME
      const resultName = await prompts({
        type: "text",
        name: "name",
        validate: res => !!res,
        message: "Insert the name of your API"
      });
      const nameApi = utils.slug(resultName.name);
      logger.info(chalk.green("API name: ") + chalk.yellow(nameApi));

      // ASK URL
      const resultUrl = await prompts({
        type: "text",
        name: "name",
        validate: res => !!res,
        message: "Insert the URL of your API. Example: /{id}/action"
      });
      const urlApi = utils.slugUrl(resultUrl.name);

      logger.info(chalk.green("API name: ") + chalk.yellow(urlApi));

      const resultMethods = await questionService.ask("Select the method of your API", listMethods);

      projectService.createApi(
        {
          _resource: model._resource._id,
          name: nameApi,
          url: urlApi,
          method: resultMethods.value,
          _roles: []
        },
        function(err, apiDb) {
          if (err) return;

          const config = configUtils.getConf();
          logger.info(
            chalk.blue("You can edit your API at ") +
              chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/apis/" + apiDb._id)
          );

          generate(null, null, logger);
        }
      );
    } else {
      projectService.createApi(getCrudService(resultType.value, resultModel.value, model._resource._id), function(err, apiDb) {
        if (err) return;

        const config = configUtils.getConf();
        logger.info(
          chalk.blue("You can edit your API at ") +
            chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/apis/" + apiDb._id)
        );

        generate(null, null, logger);
      });
    }
  });
};

const getCrudService = function(crudType, entityName, resourceId) {
  let url = "";
  let method = "";
  let returnType = "";
  let params = [];

  if (crudType == "get") {
    url = "/{id}";
    method = "GET";
    returnType = entityName;
    params = [
      {
        name: "id",
        type: "ObjectId",
        description: "Id " + entityName
      }
    ];
  } else if (crudType == "list") {
    url = "/";
    method = "GET";
    returnType = "ARRAY OF " + entityName;
  } else if (crudType == "update") {
    url = "/{id}";
    method = "POST";
    returnType = entityName;
    params = [
      {
        name: "id",
        type: "ObjectId",
        description: "Id " + entityName
      }
    ];
  } else if (crudType == "delete") {
    url = "/{id}";
    method = "DELETE";
    params = [
      {
        name: "id",
        type: "ObjectId",
        description: "Id " + entityName
      }
    ];
  } else if (crudType == "create") {
    url = "/";
    method = "POST";
    params = [
      {
        name: "obj",
        type: entityName,
        description: "Object to insert"
      }
    ];
  } else if (crudType == "findBy") {
    url = "/findBy{name}/{key}";
    method = "GET";
    params = [
      {
        name: "name",
        type: "String",
        description: "Name of the resource to search"
      },
      {
        name: "key",
        type: "ObjectId",
        description: "Id of the resource to search"
      }
    ];
  } else if (crudType.indexOf("findBy") == 0) {
    url = "/" + crudType + "/{key}";
    method = "GET";
    params = [
      {
        name: "key",
        type: "Objectid",
        description: "Id of the resource " + crudType.substring(6) + " to search"
      }
    ];
  } else if (crudType.indexOf("get") == 0) {
    url = "/{id}/" + crudType;
    method = "GET";
    params = [
      {
        name: "id",
        type: "Objectid",
        description: "ID of " + entityName + " from " + crudType.substring(3)
      }
    ];
  } else if (crudType.indexOf("addTo") == 0) {
    url = "/{id}/" + crudType.substring(5) + "/{idRel}";
    method = "GET";
    params = [
      {
        name: "id",
        type: "Objectid",
        description: "ID of " + entityName + " to link " + crudType.substring(3)
      },
      {
        name: "idRel",
        type: "Objectid",
        description: "ID of " + crudType.substring(3) + " to link "
      }
    ];
  } else if (crudType.indexOf("removeFrom") == 0) {
    url = "/{id}/" + crudType.substring(10) + "/{idRel}";
    method = "DELETE";
    params = [
      {
        name: "id",
        type: "Objectid",
        description: "ID of " + entityName + " to unlink " + crudType.substring(3)
      },
      {
        name: "idRel",
        type: "Objectid",
        description: "ID of " + crudType.substring(3) + " to unlink "
      }
    ];
  } else if (crudType.indexOf("linkTo") == 0) {
    url = "/{id}/" + crudType.substring(6) + "/{idRel}";
    method = "GET";
    params = [
      {
        name: "id",
        type: "Objectid",
        description: "ID of " + entityName + " to link " + crudType.substring(6)
      },
      {
        name: "idRel",
        type: "Objectid",
        description: "ID of " + crudType.substring(6) + " to link "
      }
    ];
  } else if (crudType.indexOf("unlinkFrom") == 0) {
    url = "/{id}/" + crudType.substring(10) + "/{idRel}";
    method = "DELETE";
    params = [
      {
        name: "id",
        type: "Objectid",
        description: "ID of " + entityName + " to unlink " + crudType.substring(10)
      },
      {
        name: "idRel",
        type: "Objectid",
        description: "ID of " + crudType.substring(10) + " to unlink "
      }
    ];
  } else if (crudType.indexOf("strictLinkListOf") == 0) {
    url = "/" + crudType.substring(16) + "/{key}";
    method = "POST";
    params = [
      {
        name: "key",
        type: "Objectid",
        description: "ID of " + entityName + " to link list"
      },
      {
        name: "list",
        type: "Array",
        description: "List of linked resource"
      }
    ];
  }

  let serv = {
    _resource: resourceId,
    name: crudType,
    url: url,
    method: method,
    description: "CRUD ACTION " + crudType,
    returnType: returnType,
    _roles: [],
    crudAction: crudType,
    _params: params
  };

  return serv;
};
