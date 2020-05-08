const fs = require("fs");

const checkPermission = function (cacheFile) {
  if (!fs.existsSync(cacheFile)) {
    fs.writeFileSync(cacheFile, "{}");
  }
  try {
    fs.chmodSync(cacheFile, "7777");
  } catch (e) {}
};
checkPermission(__dirname + "/../cache/cache/token.json");
checkPermission(__dirname + "/../cache/cache/user.json");

exports.getConf = function () {
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

exports.getProject = function () {
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
