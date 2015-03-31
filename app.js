var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');

var IMAGE_PATH = 'camera';
var directory = path.join(process.cwd(), IMAGE_PATH);

app.get('/images', function (req, res) {
    var files = fs.readdirSync(directory)
        .map(function (file) {
            return {
                name: file,
                url: path.join(IMAGE_PATH, file)
            };
    });
    
    res.json(files);
});

app.get('/images/:image', function (req, res) {
    var file = path.join(directory, req.params.image);
    
    fs.exists(file, function (exists) {
        if (!exists)
            return res.notFound(file);
        
        return fs.createReadStream(file).pipe(res);
    });
});

app.get('*', function (req, res) {
    res.send('Hello World!');
});

var server = app.listen(3000, function () {
    
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);

});