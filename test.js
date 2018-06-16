var promptly = require('promptly');

promptly.prompt('Insert name of your project').then(val => {
    console.log('val:', val)
})