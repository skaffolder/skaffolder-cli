module.export = function () {
    let config = fs.readFileSync('.skaffolder/config.json');
    config = JSON.parse(config);
}