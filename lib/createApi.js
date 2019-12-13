var projectService = require("../service/projectService");
var generate = require("../lib/generate");
var prompt = require("prompt");
var questionService = require("../utils/questionService");
var colors = require("colors/safe");
var validator = require("../utils/validator");
var chalk = require("chalk");
var properties = require("../properties");
var configUtils = require("../utils/config");

module.exports = (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  let listMethods = [
    {
      description: "GET",
      value: "GET"
    },
    {
      description: "POST",
      value: "POST"
    },
    {
      description: "DELETE",
      value: "DELETE"
    },
    {
      description: "PATCH",
      value: "PATCH"
    },
    {
      description: "PUT",
      value: "PUT"
    },
    {
      description: "OPTIONS",
      value: "OPTIONS"
    }
  ];

  let listType = [
    {
      description: "Custom API",
      value: "custom"
    },
    {
      description: "get",
      value: "get"
    },
    {
      description: "update",
      value: "update"
    },
    {
      description: "create",
      value: "create"
    },
    {
      description: "list",
      value: "list"
    },
    {
      description: "delete",
      value: "delete"
    }
  ];

  projectService.getModelsList(function(err, models) {
    let listModels = models.map(model => {
      return {
        description: model.name,
        value: model._id
      };
    });
    questionService.ask(
      {
        description: "Select the model on which you want to create the API",
        list: listModels
      },
      function(resultModel) {
        let model = {};
        models.filter(item => {
          if (item._id == resultModel.value) {
            model = item;
          }
        });

        questionService.ask(
          {
            description: "Select type of your API",
            list: listType.filter(value => {
              for (let i in model._resource._services) {
                let serv = model._resource._services[i];
                if (serv.crudAction == value.value) return false;
              }
              return true;
            })
          },
          function(resultType) {
            if (resultType.value == "custom") {
              // ASK NAME
              prompt.get(
                {
                  properties: {
                    name: {
                      description: "Insert id of you API",
                      required: true
                    }
                  }
                },
                function(err, resultName) {
                  // ASK URL
                  prompt.get(
                    {
                      properties: {
                        url: {
                          description:
                            "Insert URL of you API. Example: /{id}/action",
                          required: true
                        }
                      }
                    },
                    function(err, resultUrl) {
                      questionService.ask(
                        {
                          description: "Select the method of the API",
                          list: listMethods
                        },
                        function(resultMethods) {
                          projectService.createApi(
                            {
                              _resource: model._resource._id,
                              name: resultName.name,
                              url: resultUrl.url,
                              method: resultMethods.value,
                              _roles: []
                            },
                            function(err, apiDb) {
                              if (err) return;

                              var config = configUtils.getConf();
                              logger.info(
                                chalk.blue("You can edit your API at ") +
                                  chalk.yellow(
                                    properties.endpoint +
                                      "/#!/projects/" +
                                      config.project +
                                      "/apis/" +
                                      apiDb._id
                                  )
                              );

                              generate(null, null, logger);
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            } else {
              projectService.createApi(
                getCrudService(
                  resultType.value,
                  resultModel.text,
                  model._resource._id
                ),
                function(err, apiDb) {
                  if (err) return;

                  var config = configUtils.getConf();
                  logger.info(
                    chalk.blue("You can edit your API at ") +
                      chalk.yellow(
                        properties.endpoint +
                          "/#!/projects/" +
                          config.project +
                          "/apis/" +
                          apiDb._id
                      )
                  );

                  generate(null, null, logger);
                }
              );
            }
          }
        );
      }
    );
  });
};

var getCrudService = function(crudType, entityName, resourceId) {
  var url = "";
  var method = "";
  var returnType = "";
  var params = [];

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
        description:
          "Id of the resource " + crudType.substring(6) + " to search"
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
        description:
          "ID of " + entityName + " to unlink " + crudType.substring(3)
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
        description:
          "ID of " + entityName + " to unlink " + crudType.substring(10)
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

  var serv = {
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
