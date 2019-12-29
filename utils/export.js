var projectService = require("../service/projectService");
var generatorBean = require("../generator/GeneratorBean");
var fs = require("fs");

var exportProject = function(params, cb) {
  // Call Skaffolder server
  projectService.exportProject(params, function(err, result) {
    let workspacePath = params.workspacePath ? params.workspacePath : "";
    // Update project Id
    let conf = fs.readFileSync(workspacePath + ".skaffolder/config.json", "utf-8");
    try {
      conf = JSON.parse(conf);
    } catch (e) {
      conf = {};
    }

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
  });
};

exports.exportProject = exportProject;
