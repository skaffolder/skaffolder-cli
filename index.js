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
const generateCmd = require('./lib/generate');
const getProjectUrlCmd = require('./lib/getProjectUrl');

prog
    .version('1.0.27')

    // start
    .command('login', 'Log in into Skaffolder')
    .action(loginCmd)
    .command('logout', 'Log out from Skaffolder\n\n---- Create Project ----\n')
    .action(logoutCmd)

    .command('new', 'Create a new Skaffolder project')
    .action(createCmd)
    .command('open', 'Open a Skaffolder project')
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
    .command('add api', 'Create a new api in Skaffolder project\n\n---- Utils ----\n')
    .action(createApiCmd)

    // utils

    .command('get project url', 'Get Skaffolder project URL')
    .action(getProjectUrlCmd)
    .command('reload generator', 'Log out from Skaffolder')
    .action(reloadGeneratorCmd)
//.option('--variant <variant>', 'Which <variant> of the template is going to be created')

prog.parse(process.argv);