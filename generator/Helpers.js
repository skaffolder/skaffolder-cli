exports.registerHelpers = function(Handlebars) {
  const helpers = require("handlebars-helpers")({
    handlebars: Handlebars
  });
  const groupBy = require("handlebars-group-by");

  groupBy.register(Handlebars);

  // SET HANDLEBARS
  Handlebars.registerHelper("joinObj", function(arr, field) {
    let result = [];
    for (i in arr) {
      result.push(arr[i][field]);
    }
    return JSON.stringify(result).replace(/,/g, ", ");
  });

  Handlebars.registerHelper("joinObj2", function(arr) {
    let result = "";
    for (i in arr) {
      result += (i != 0 ? ', "' : '"') + arr[i]["name"] + '"';
    }
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper("joinRoleObj", function(arr) {
    let result = "";
    for (i in arr) {
      result += ', "ROLE_' + arr[i]["name"] + '"';
    }
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper("roleObj", function(arr) {
    let result = '"' + arr[0]["name"] + '"';
    for (i in arr) {
      if (arr[0]["name"] === arr[i]["name"]) continue;
      result += ', "' + arr[i]["name"] + '"';
    }
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper("joinRoleObj2", function(arr) {
    let result = "";
    for (let i = 0; i < arr.length; i++) {
      if (i == 0) {
        result += '"ROLE_' + arr[i]["name"] + '"';
      } else {
        result += ', "ROLE_' + arr[i]["name"] + '"';
      }
    }
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper("roleObj", function(arr) {
    let result = '"' + arr[0]["name"] + '"';
    for (i in arr) {
      if (arr[0]["name"] === arr[i]["name"]) continue;
      result += ', "' + arr[i]["name"] + '"';
    }
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper("json", function(context) {
    return new Handlebars.SafeString(JSON.stringify(context, null, 2));
  });

  Handlebars.registerHelper("firstUpperCase", function(s, options) {
    return s && s[0].toUpperCase() + s.slice(1);
  });

  Handlebars.registerHelper("subStr", function(string, start, options) {
    return string.substr(start);
  });

  Handlebars.registerHelper("subStrCap", function(string, start, options) {
    return (
      string
        .substr(start)
        .charAt(0)
        .toUpperCase() + string.substr(start).slice(1)
    );
  });

  Handlebars.registerHelper("equal", function(left, right, options) {
    if (left) left = left.toString();
    if (right) right = right.toString();

    if (left == right) {
      if (options.fn) return options.fn(this);
      else return 1;
    }

    if (options.inverse) return options.inverse(this);
    else return 0;
  });

  Handlebars.registerHelper("isNotLast", function(array, index, options) {
    if (array.length == index + 1) return options.inverse(this);
    else return options.fn(this);
  });

  Handlebars.registerHelper("isNotLastUser", function(array, index, options) {
    if (array.length == index + 1) return options.inverse(this);
    else {
      if (array.length == index + 2) {
        arrayTmp = array.slice(index);
        if (arrayTmp.slice(-1)[0].name == "username") return options.inverse(this);
      } else return options.fn(this);
    }
  });

  Handlebars.registerHelper("isNotLastRelations", function(array, resource, index, options) {
    if (array.length == index + 1) {
      return options.inverse(this);
    } else {
      for (let i = index + 1; i < array.length; i++) {
        if (array[i]._ent1._id.toString() != resource._id.toString()) return options.fn(this);
        return options.inverse(this);
      }
    }

    //else
    //return options.fn(this);
  });
  Handlebars.registerHelper("checkRelation", function(array, resource, options) {
    if (array.length == 0) return options.inverse(this);
    if (array)
      for (let item in array) {
        if (array[item]._ent1._id.toString() == resource._id.toString()) return options.fn(this);
      }
  });

  Handlebars.registerHelper("hasRelation1m", function(resource, options) {
    let relations = resource._relations;

    if (relations.length == 0) {
      if (options.inverse) return options.inverse(this);
      else return false;
    }

    if (relations)
      for (let item in relations) {
        if (relations[item]._ent1._id.toString() == resource._entity._id.toString() && relations[item].type == "1:m") {
          if (options.fn) return options.fn(this);
          else return true;
        }
      }
  });

  Handlebars.registerHelper("hasRelationmm", function(resource, options) {
    let relations = resource._relations;

    if (relations.length == 0) {
      if (options.inverse) return options.inverse(this);
      else return false;
    }

    if (relations)
      for (let item in relations) {
        if (relations[item]._ent1._id.toString() == resource._entity._id.toString() && relations[item].type == "m:m") {
          if (options.fn) return options.fn(this);
          else return true;
        }
      }
  });

  Handlebars.registerHelper("checkExternalRelation", function(array, resource, options) {
    if (array.length == 0) return options.inverse(this);
    if (array)
      for (let item in array) {
        if (array[item]._ent1._id.toString() != resource._id.toString()) return options.fn(this);
      }
  });

  Handlebars.registerHelper("notEqual", function(left, right, exact, options) {
    if (left) left = left.toString();
    if (right) right = right.toString();
    options = options || exact;
    exact = exact === "exact" ? true : false;
    let is_equal = exact ? left === right : left == right;
    if (!is_equal) return options.fn(this);
    return options.inverse(this);
  });

  Handlebars.registerHelper("notHome", function(parameter, options) {
    if (parameter) parameter = parameter.toString().toLowerCase();
    if (parameter !== "home") return options.fn(this);
    return options.inverse(this);
  });

  Handlebars.registerHelper("notEqualArray", function(string, options) {
    let search = ["update", "create", "delete", "list", "get"];
    for (let id in search) {
      if (search[id] == string) return options.inverse(this);
    }
    return options.fn(this);
  });

  Handlebars.registerHelper("isInUrl", function(param, url, options) {
    let urlParams = url.match(/{\w+}/g);
    if (urlParams && urlParams.indexOf("{" + param + "}") != -1) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("relationName", function(resource, name, url, options) {
    relation = resource.find(x => x.type === "m:m");
    nameRelation = relation && relation.name === name.substr(3) && relation._ent2.name;
    return nameRelation;
  });

  Handlebars.registerHelper("relationNameService", function(resource, name, url, options) {
    relation = resource.find(x => x.name.toLowerCase() === name.substr(6).toLowerCase());
    nameRelation = relation && relation.name === name.substr(6) && relation._ent2.name;
    return nameRelation;
  });

  Handlebars.registerHelper("relationNameServiceLowercase", function(resource, name, url, options) {
    relation = resource.find(x => x.name.toLowerCase() === name.substr(6).toLowerCase());
    nameRelation = relation && relation.name === name.substr(6) && relation._ent2.name;
    return nameRelation.toLowerCase();
  });

  Handlebars.registerHelper("resolveSQLtype", function(value, options) {
    if (value == "Number") return "numeric";
    else if (value == "Date") return "date";
    else if (value == "Integer") return "int";
    else if (value == "Decimal") return "decimal(6,2)";
    else if (value == "String") return "varchar(130)";
    else if (value == "Boolean") return "bool";
    else if (value == "ObjectId") return "int(11)";

    return "varchar(30)";
  });

  Handlebars.registerHelper("isEmptyArray", function(value, options) {
    if (value && value.length == 0) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("notEmpty", function(value, options) {
    if (value && value.length != 0) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("isEmpty2", function(value, options) {
    if (value && value.length != 0) return options.inverse(this);
    else return options.fn(this);
  });

  Handlebars.registerHelper("isEmptyNull", function(value, options) {
    if (value && value.length != 0) return options.inverse(this);
    else return options.fn(this);
  });

  Handlebars.registerHelper("notNull", function(value, options) {
    if (value != undefined) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("isNull", function(value, options) {
    if (value == null) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("startWith", function(src, search, options) {
    if (src && src.indexOf(search) == 0 && src != search) {
      if (options.fn) return options.fn(this);
      else return 1;
    } else {
      if (options.inverse) return options.inverse(this);
      else return 0;
    }
  });

  Handlebars.registerHelper("notStartWith", function(src, search, options) {
    if (src && src.indexOf(search) == 0 && src != search) return options.inverse(this);
    else return options.fn(this);
  });

  Handlebars.registerHelper("editUrlParam", function(url) {
    return url
      .replace(/{/g, ":")
      .replace(/}/g, "")
      .replace(/\/$/, "");
  });

  Handlebars.registerHelper("editUrlParamGo", function(url) {
    return url;
  });

  Handlebars.registerHelper("editUrlParamRegExp", function(url) {
    if (url == "/") url = "/*";

    return url.replace(/{[\s\S]*}/g, "([^/])+");
  });

  Handlebars.registerHelper("toGoType", function(type) {
    if (type == "Integer") type = "int";
    if (type == "Date") type = "time.Time";
    if (type == "Number") type = "float32";
    if (type == "Decimal") type = "float32";
    if (type == "String") type = "string";
    if (type == "Boolean") type = "bool";
    if (type == "ObjectId") type = "int";
    if (type == "Custom") type = "string";
    return type;
  });

  Handlebars.registerHelper("toSequelizeType", function(type) {
    if (type == "Integer") type = "Sequelize.INTEGER";
    if (type == "Date") type = "Sequelize.DATE";
    if (type == "Number") type = "Sequelize.FLOAT";
    if (type == "Decimal") type = "Sequelize.DECIMAL";
    if (type == "String") type = "Sequelize.STRING";
    if (type == "Boolean") type = "Sequelize.BOOLEAN";
    if (type == "ObjectId") type = "Sequelize.INTEGER";
    if (type == "Custom") type = "Sequelize.STRING";
    return type;
  });

  Handlebars.registerHelper("toJSType", function(type) {
    if (type == "Integer") type = "Number";
    if (type == "Decimal") type = "Number";
    if (type == "Custom") type = "Object";
    return type;
  });

  Handlebars.registerHelper("toTSType", function(type) {
    if (type == "Integer") type = "number";
    if (type == "Number") type = "number";
    if (type == "Decimal") type = "number";
    if (type == "String") type = "string";
    if (type == "Custom") type = "string";
    return type;
  });

  Handlebars.registerHelper("toJDBCType", function(type) {
    if (type == "Integer") type = "Int";
    if (type == "Decimal") type = "Double";
    if (type == "Number") type = "Double";
    if (type == "ObjectId") type = "Long";
    if (type == "Custom") type = "String";
    return type;
  });

  Handlebars.registerHelper("toJavaType", function(type) {
    if (type == "Decimal") type = "BigDecimal";
    if (type == "Number") type = "Double";
    if (type == "ObjectId") type = "Long";
    if (type == "Custom") type = "String";
    return type;
  });

  Handlebars.registerHelper("toCType", function(type) {
    if (type == "Integer") type = "int";
    if (type == "Decimal") type = "string";
    if (type == "Number") type = "int";
    if (type == "ObjectId") type = "string";
    if (type == "String") type = "string";
    if (type == "Date") type = "DateTime";
    if (type == "Boolean") type = "boolean";
    if (type == "Custom") type = "Object";
    return type;
  });

  Handlebars.registerHelper("toSwaggerType", function(type) {
    if (type == "Integer") type = "integer";
    if (type == "Decimal") type = "number";
    if (type == "Number") type = "number";
    if (type == "ObjectId") type = "string";
    if (type == "String") type = "string";
    if (type == "Date") type = "integer";
    if (type == "Boolean") type = "boolean";
    if (type == "ObjectId") type = "string";
    if (type == "Custom") type = "object";
    return type;
  });

  Handlebars.registerHelper("removeFinalSlash", function(url) {
    if (url[url.length] == "/") url.substr(0, url.length - 1);
    return url;
  });

  Handlebars.registerHelper("removeInitialSlash", function(url) {
    if (url[0] == "/")
      return url
        .substr(1, url.length)
        .replace(/{/g, ":")
        .replace(/}/g, "");
    return url;
  });

  Handlebars.registerHelper("isRequired", function(required, options) {
    if (!required) {
      return options.fn("?");
    }
  });

  Handlebars.registerHelper("toFileName", function(name) {
    name = name.replace(/([a-z])([A-Z])/g, "$1-$2");
    name = name.toLowerCase();
    return name;
  });

  Handlebars.registerHelper("isMtoM", function(RelationName, relations, resourceName, options) {
    let found = false;
    RelationName = RelationName.substr(6);
    for (let i in relations) {
      if (relations[i].name == RelationName && relations[i].type == "m:m" && relations[i]._ent1.name == resourceName)
        found = relations[i];
    }

    this.relations = found;
    if (found) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("eachResource", function(services, options) {
    let resources = {};
    let buffer = "";

    for (let s in services) {
      try {
        if (!resources[services[s]._resource._id]) {
          resources[services[s]._resource._id] = true;
          buffer += options.fn(services[s]._resource);
        }
      } catch (e) {
        e.message = "Resource not found in service:\n" + JSON.stringify(services[s]) + "\n" + e.message;
        throw e;
      }
    }

    return buffer;
  });

  Handlebars.registerHelper("getDbName", function(dbs, idDb) {
    for (let i in dbs) {
      if (dbs[i]._id.toString() == idDb.toString()) return dbs[i].name;
    }
  });

  Handlebars.registerHelper("getDbNameToFileName", function(dbs, idDb) {
    try {
      for (let i in dbs) {
        if (dbs[i]._id.toString() == idDb.toString()) {
          let name = dbs[i].name;
          name = name.replace(/([a-z])([A-Z])/g, "$1-$2");
          name = name.toLowerCase();
          return name;
        }
      }
    } catch (e) {
      e.message = "Database not found: " + idDb + "\n" + e.message;
      throw e;
    }
  });

  Handlebars.registerHelper("buildUrlSecurity", function(url, options) {
    return url === "/{id}" ? "/**" : url;
  });

  Handlebars.registerHelper("unslug", function(msg) {
    return msg.replace(/_/g, " ");
  });

  Handlebars.registerHelper("oneElementArray", function(value, options) {
    if (value && value.length == 1) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("findInArray", function(array, key, value, options) {
    for (let i in array) {
      if (array[i][key] == value) {
        if (options.fn) return options.fn(this);
        else return true;
      }
    }
    if (options.inverse) return options.inverse(this);
    else return false;
  });

  Handlebars.registerHelper("hasInArray", function(array, key, options) {
    for (let i in array) {
      if (array[i][key] != null) {
        if (options.fn) return options.fn(this);
        else return true;
      }
    }
    if (options.inverse) return options.inverse(this);
    else return false;
  });

  Handlebars.registerHelper("oneElementArray", function(value, options) {
    if (value && value.length == 1) return options.fn(this);
    else return options.inverse(this);
  });
  Handlebars.registerHelper("firstElementArray", function(array, options) {
    return array[0]["name"];
  });

  Handlebars.registerHelper("urlSecurity", function(url, options) {
    if (url === "/") return "";
    if (url.indexOf("{id}") != -1) return url.replace("{id}", "**");
  });

  Handlebars.registerHelper("moreThanOneElement", function(array, options) {
    if (array.length > 1) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("distinctRelations", function(array, entityName, options) {
    let present = [];
    let buffer = "";

    for (let i in array) {
      let item = array[i];

      if (item.type == "1:m" && item._ent1.name == entityName) {
        if (!present[item._ent2.name]) {
          present[item._ent2.name] = item;
          buffer += options.fn(item);
        }
      }
    }

    return buffer;
  });
  Handlebars.registerHelper("distinctModules", function(array, options) {
    let present = [];
    let buffer = "";

    for (let i in array) {
      let item = array[i];
      if (!present[item.name]) {
        present[item.name] = item;
        buffer += options.fn(item);
      }
    }
    return buffer;
  });

  Handlebars.registerHelper("equalFindBy", function(str1, str2, options) {
    if (("findBy" + str1).toLowerCase() === str2.toLowerCase()) {
      if (options.fn) return options.fn(this);
      else return 1;
    }
  });

  Handlebars.registerHelper("findByNotRelation", function(resource, crud, options) {
    if (resource._relations.filter(rel => rel.name === crud.slice(6)).length > 0) return options.inverse(this);
    else return options.fn(this);
  });

  Handlebars.registerHelper("distinctRelationsEditComponent", function(crudResource, options) {
    let present = [];
    let buffer = "";

    buffer += options.fn({
      resourceName: crudResource.name,
      dbName: crudResource._db
    });
    present[crudResource.name] = true;

    for (let i in crudResource._relations) {
      let item = crudResource._relations[i];

      if (item._ent1._id.toString() == crudResource._entity._id.toString()) {
        let resourceName = item._ent2.name;
        if (!present[resourceName]) {
          let result = {
            resourceName: resourceName,
            dbName: item._ent2._resource._db
          };
          present[resourceName] = result;
          buffer += options.fn(result);
        }
      } else {
        let resourceName = item._ent1.name;

        if (!present[resourceName]) {
          let result = {
            resourceName: resourceName,
            dbName: item._ent2._resource._db
          };
          present[resourceName] = result;
          buffer += options.fn(result);
        }
      }
    }

    return buffer;
  });

  Handlebars.registerHelper("getReducerName", function(service, options) {
    if (service.name == "list") return "list" + service._resource.name.charAt(0).toUpperCase() + service._resource.name.slice(1);
    if (service.name == "update") return service._resource.name.toLowerCase();
    if (service.name == "create") return service._resource.name.toLowerCase();
    if (service.name == "delete") return service._resource.name.toLowerCase();
    if (service.name == "get") return service._resource.name.toLowerCase();

    if (service.name.startsWith("findBy")) {
      return "list" + service._resource.name.charAt(0).toUpperCase() + service._resource.name.slice(1);
    }

    return service.name;
  });
};
