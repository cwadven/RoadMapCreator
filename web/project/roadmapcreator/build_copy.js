const fs = require('fs');
const ncp = require('ncp').ncp;

ncp.limit = 16;

fs.rmdirSync("../../static/static/css", {recursive: true}, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('Legacy CSS Remove')
})
fs.rmdirSync("../../static/static/js", {recursive: true}, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('Legacy JS Remove')
})
fs.rmdirSync("../../static/static/media", {recursive: true}, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('Legacy JS Remove')
})

console.log('Copying files...');
ncp('build/index.html', '../../templates/index.html', function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('Copying files complete.');
});


ncp('build/static', '../../static/static', function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('Copying files complete.');
});

