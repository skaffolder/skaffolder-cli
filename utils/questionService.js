const chalk = require('chalk');

exports.ask = function (options, cb) {

    // INIT
    const list = require('select-shell')({
        pointer: ' ▸ ',
        pointerColor: 'yellow',
        checked: ' ◉  ',
        unchecked: ' ◎  ',
        checkedColor: 'blue',
        msgCancel: 'No selected options!',
        msgCancelColor: 'orange',
        multiSelect: false,
        inverse: true,
        prepend: true
    });

    // CONFIGURE
    for (const i in options.list) {
        list.option(options.list[i].description, options.list[i].value);
    }

    // ASK QUESTION
    console.log(chalk.green('Skaffolder') + ": " + chalk.gray(options.description));

    // ASK LIST
    list.list();

    // CALLBACK
    list.on('select', res => cb(res[0]));

}