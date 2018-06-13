#!/usr/bin/env node

const prog = require('caporal');
const createCmd = require('./lib/create');
const loginCmd = require('./lib/login');
const logoutCmd = require('./lib/logout');
const reloadGeneratorCmd = require('./lib/reloadGenerator');

prog
    .version('1.0.0')
    .command('login', 'Log in into Skaffolder')
    .action(loginCmd)
    .command('new project', 'Create a new Skaffolder project')
    .action(createCmd)
    .command('generate', 'Generate Skaffolder Template')
    .action(logoutCmd)
    .command('reload generator', 'Log out from Skaffolder')
    .action(reloadGeneratorCmd)
    .command('logout', 'Log out from Skaffolder')
    .action(logoutCmd);
//.argument('<template>', 'Template to use')
//.option('--variant <variant>', 'Which <variant> of the template is going to be created')

prog.parse(process.argv);