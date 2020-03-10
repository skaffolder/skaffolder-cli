const cache = require("persistent-cache");
const config = require("./utils/config");
const exportUtils = require("./utils/export");
const getEnvCmd = require("./lib/getEnv");
const getProjectUrlCmd = require("./lib/getProjectUrl");
const globals = cache();
const loginCmd = require("./lib/login");
const logoutCmd = require("./lib/logout");
const setEnvCmd = require("./lib/setEnv");

const create = require("./utils/generator");
const generatorBean = require("./generator/GeneratorBean");
const generatorUtils = require("./generator/GeneratorUtils");
const helpers = require("./generator/Helpers");
const offline = require("./lib/offline");
const offlineService = require("./utils/offlineService");
const projectService = require("./service/projectService");

exports.getUser = function() {
  return globals.getSync("user");
};

exports.createPage = offline.createPage;
exports.createProjectExtension = create.createProjectExtension;
exports.exportProject = exportUtils.exportProject;
exports.generate = generatorBean.generate;
exports.generateFile = generatorUtils.generateFile;
exports.getEnv = getEnvCmd;
exports.getGenFiles = generatorBean.getGenFiles;
exports.getProject = config.getProject;
exports.getProjectData = offlineService.getProjectData;
exports.getProjectUrlCmd = getProjectUrlCmd;
exports.getProperties = create.getProperties;
exports.getTemplate = projectService.getTemplate;
exports.init = generatorUtils.init;
exports.login = loginCmd;
exports.logout = logoutCmd;
exports.Offline = offline;
exports.registerHelpers = helpers.registerHelpers;
exports.setEnv = setEnvCmd;
exports.translateYamlProject = offlineService.translateYamlProject;
