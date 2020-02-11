const projectService = require("../service/projectService");
const generatorBean = require("../generator/GeneratorBean");
const fs = require("fs");
const offlineService = require("../utils/offlineService");
const yaml = require("yaml");
const lodash = require("lodash");

const exportProject = function(params, cb) {
  // Call Skaffolder server
  try {
    projectService.exportProject(params, function(err, result) {
      if (err) {
        cb(err);
      }
      let workspacePath = params.workspacePath ? params.workspacePath : "";
      // Update project Id
      let conf = {};
      try {
        let confFile = fs.readFileSync(workspacePath + ".skaffolder/config.json", "utf-8");
        conf = JSON.parse(confFile);
      } catch (e) {}

      if (conf.project != result.projectId) {
        conf.project = result.projectId;
        try {
          fs.writeFileSync(workspacePath + ".skaffolder/config.json", JSON.stringify(conf, null, 4));
        } catch (e) {
          console.error(e);
        }
      }

      // Update openapi
      generatorBean.generateSingleFile(workspacePath, "openapi.yaml", result.data);

      // Extends previous values
      let newYaml = offlineService.getYaml(workspacePath + "./openapi.yaml");
      let mergedYaml = lodash.merge(params.skObject, newYaml);
      let yamlContent = yaml.stringify(mergedYaml);
      fs.writeFileSync(workspacePath + "openapi.yaml", yamlContent, "utf-8");

      // Execute callback
      if (!result.logs || result.logs.length == 0) {
        result.logs = ["<div class='no-result'>Nothing changed</div>"];
      }
      cb(err, result.logs, result.projectId);
    });
  } catch (e) {
    cb(e);
  }
};

exports.exportProject = exportProject;
