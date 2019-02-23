#!/usr/bin/env node

const prog = require('caporal');
const createCmd = require('./lib/create');
const createPageCmd = require('./lib/createPage');
const createApiCmd = require('./lib/createApi');
const createModelCmd = require('./lib/createModel');
const loginCmd = require('./lib/login');
const openCmd = require('./lib/open');
const logoutCmd = require('./lib/logout');
const reloadGeneratorCmd = require('./lib/reloadGenerator');
const saveGeneratorCmd = require('./lib/saveGenerator');
const importGeneratorCmd = require('./lib/importGenerator');
const publishGeneratorCmd = require('./lib/publishGenerator');
const generateCmd = require('./lib/generate');
const getProjectUrlCmd = require('./lib/getProjectUrl');
const importDbCmd = require('./lib/importDb');

prog.version('1.1.18')

    // start
    .command('login', 'Log in into Skaffolder')
    .action(loginCmd)
    .command('logout', 'Log out from Skaffolder\n\n---- Create Project ----\n')
    .action(logoutCmd)

    .command('new', 'Create a new Skaffolder project')
    .action(createCmd)
    .command('open', 'Open a Skaffolder project')
    .argument('[id project]', 'Id of the project to open', null, "")
    .argument('[id generator]', 'Id of the generator to open', null, "")
    .action(openCmd)
    .command('generate', 'Generate Skaffolder Template\n\n---- Manage Project ----\n')
    .action(generateCmd)

    // manage
    .command('add page', 'Create a new page in Skaffolder project')
    .argument('[name]', 'Name of the page', null, "")
    .action(createPageCmd)
    .command('add model', 'Create a new model in Skaffolder project')
    .argument('[name]', 'Name of the model', null, "")
    .action(createModelCmd)
    .command('add api', 'Create a new api in Skaffolder project\n\n---- Generator ----\n')
    .action(createApiCmd)

    // generator
    .command('generator load', 'Load generator files from Skaffolder platform to local folder')
    .action(reloadGeneratorCmd)
    .command('generator save', 'Save generator files from local folder to Skaffolder platform')
    .action(saveGeneratorCmd)
    .command('generator import', 'Import generator files from current folder')
    .action(importGeneratorCmd)
    .command('generator publish', 'Share your local generator files with Skaffolder community\n\n---- Utils ----\n')
    .action(publishGeneratorCmd)

    // utils
    .command('get project url', 'Get Skaffolder project URL') // get project url endpoint:http://localhost:3001
    .argument('[opt]', '', null, null)
    .action(getProjectUrlCmd)
    .command('import db', 'Import database entities from Schema Spy XML')
    .argument('<file>', 'XML file to import', null, null)
    .action(importDbCmd)
//.option('--variant <variant>', 'Which <variant> of the template is going to be created')

prog.parse(process.argv);