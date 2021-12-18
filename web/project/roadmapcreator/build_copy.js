const fs = require('fs');
const ncp = require('ncp').ncp;

ncp.limit = 16;

if (!fs.existsSync("../../static/static/css")){
    fs.mkdirSync("../../static/static/css");
}
fs.rmdirSync("../../static/static/css", {recursive: true}, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('Legacy CSS Remove')
})
if (!fs.existsSync("../../static/static/js")){
    fs.mkdirSync("../../static/static/js");
}
fs.rmdirSync("../../static/static/js", {recursive: true}, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('Legacy JS Remove')
})
if (!fs.existsSync("../../static/static/media")){
    fs.mkdirSync("../../static/static/media");
}
fs.rmdirSync("../../static/static/media", {recursive: true}, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('Legacy JS Remove')
})

console.log('Copying files...');

if (!fs.existsSync("../../templates/")){
    fs.mkdirSync("../../templates/");
}
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

