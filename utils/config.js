const fs = require("fs");

exports.getConf = function() {
  let config = "";
  try {
    config = fs.readFileSync(".skaffolder/config.json");
    try {
      config = JSON.parse(config);
    } catch (e) {
      console.error(".skaffolder/config.json JSON non parsable");
    }
  } catch (e) {}
  return config;
};

exports.getProject = function() {
  let config = "";
  try {
    config = fs.readFileSync(".skaffolder/config.json");
    try {
      config = JSON.parse(config);
    } catch (e) {
      console.error(".skaffolder/config.json JSON non parsable");
    }
  } catch (e) {}
  return config.project;
};
