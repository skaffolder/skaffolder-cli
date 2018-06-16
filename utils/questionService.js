var chalk = require('chalk');

exports.ask = function (options, cb) {

    // INIT

    // const prompt = require('select-prompt')

    // const colors = [
    //     {title: 'red',    value: '#f00'},
    //     {title: 'yellow', value: '#ff0'},
    //     {title: 'green',  value: '#0f0'},
    //     {title: 'blue',   value: '#00f'},
    //     {title: 'black',  value: '#000'},
    //     {title: 'white',  value: '#fff'}
    // ]

    // prompt('What is your favorite color?', colors, {cursor: 3})
    // .on('data', (e) => console.log('Interim value', e.value))
    // .on('abort', (v) => console.log('Aborted with', v))
    // .on('submit', (v) => console.log('Submitted with', v))

    // INIT

    // const cliSelect = require('cli-select');
    // var optArray = options.list.map((val) => val.description);
    // cliSelect({
    //     values: optArray
    // }, function (result, b, c) {
    //     result = {
    //         value: options.list[result.id].value,
    //         description: options.list[result.id].description
    //     }
    //     cb(result);
    // });



    // INIT

    var list = require('select-shell')({
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
    for (var i in options.list) {
        list.option(options.list[i].description, options.list[i].value);
    }

    // ASK QUESTION
    console.log(chalk.green('Skaffolder') + ": " + chalk.gray(options.description));

    // ASK LIST
    list.list();

    // CALLBACK
    list.on('select', res => {
        // rli.close();
        return cb(res[0])
    });

}