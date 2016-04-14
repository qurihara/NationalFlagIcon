//app.js
var http = require('http'),
    util = require('util'),
    formidable = require('formidable'),
    server;
var fs = require('fs.extra');
var path = require('path')
var settings = require('./settings');
var url = require('url');
var ejs = require('ejs');

var template = fs.readFileSync('viewer.ejs', 'utf-8');

var TEST_TMP="./img";
var TEST_PORT=settings.port;//3000;

var exec = require('child_process').exec;
var rmdir = require('rmdir');

server = http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<h4>The Unievrsal Background Filter for SNS Profile Picture</h4>'+
      '<p>Upload your SNS profile picture and wait for a while (say, 30 sec. or so).</p>'+
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'+
      '<p>Example:</p><table border="0"><tr>'+
      '<td align="center"><img src="example/icon.jpg" width = "64" height = "64"></td>'+
      '<td align="center">+</td>'+
      '<td align="center"><img src="example/movie.gif" width = "64" height = "64"></td>'+
      '<td align="center">=</td>'+
      '<td align="center"><img src="example/resize_movie_icon.gif" width = "64" height = "64"></td>'+
      '</tr></table>' +
      '<p>(c)Kazutaka Kurihara</p>'
    );
  } else if (req.url == '/upload') {
    var form = new formidable.IncomingForm(),
        files = [],
        fields = [];

    form.uploadDir = TEST_TMP;

    form
      .on('field', function(field, value) {
        console.log(field, value);
        fields.push([field, value]);
      })
      .on('file', function(field, file) {
        console.log(field, file);
        files.push([field, file]);
      })
      .on('end', function() {
        var now = new Date().getTime();
        console.log('-> upload done');
        // res.writeHead(200, {'content-type': 'text/html'});
        // res.write('Uploaded: <a href="' + vl + '" target="_blank">viewer link</a>');
        // res.end();

        var filestr = '';
        for(var i =0;i<files.length;i++){
          var pat = files[i][1]['path'];
          var dir = now.toString();

          var child = exec(settings.exepath + " " + pat + " " + now + " 400x400", function(err, stdout, stderr) {
            if (!err) {
              //console.log('stdout: ' + stdout);
              //console.log('stderr: ' + stderr);

              //manipulate output
              var gifpat = now + '/icon_movie.gif';
              //var movpat = pat + '.mp4';
              var movpat = now + '/icon_movie.mp4';
              fs.readFile(gifpat,function(err,data){
                if(err){
                  console.log(err);
                  deleteFiles(pat,dir);
                  return;
                }
                var str = data.toString('base64');

                fs.readFile(movpat,function(err,datam){
                  if(err){
                    console.log(err);
                    deleteFiles(pat,dir);
                    return;
                  }
                  var strm = datam.toString('base64');

                  var data = ejs.render(template, {
                    imgs: "'data:image/gif;base64," + str + "'",
                    rotation: "'data:video/mp4;base64," + strm + "'",
//                    speed: movpat
                  });
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.write(data);
                  res.end();

                  console.log(pat);
                  deleteFiles(pat,dir);
                });
              });

            } else {
              console.log(err);
              // err.code will be the exit code of the child process
              console.log(err.code);
              //err.signal will be set to the signal that terminated the process
              console.log(err.signal);
              deleteFiles(pat,dir);
            }
          });
        }
      });
    form.parse(req);
  } else {
    fs.readFile(__dirname + req.url,function(err,data){
      if(err){
        res.writeHead(500);
        return res.end('Error: ' + err);
      }
      res.writeHead(200);
      res.write(data);
      res.end();
    });
//    res.writeHead(404, {'content-type': 'text/plain'});
//    res.end('404');
  }
});
server.listen(TEST_PORT);

console.log('listening on http://localhost:'+TEST_PORT+'/');

function deleteFiles(pat,dir){
  fs.unlinkSync(pat);
  rmdir(dir, function (err, dirs, files) {
    // console.log(dirs);
    // console.log(files);
    // console.log('all files are removed');
  });

}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
