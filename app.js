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
var TEST_PORT=3000;

var exec = require('child_process').exec;
var rmdir = require('rmdir');

server = http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<h4>The Unievrsal Background Filter for SNS Profile Picture</h4>'+
      '<p>Upload your SNS profile picture and wait for a while.</p>'+
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'+
      ' <p>(c)Kazutaka Kurihara</p>'
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

          // filestr = filestr + "\t'" + files[i][1]['name'] + "',\n";
          // fs.readFile(pat,function(err,data){
          //   if(err){
          //     return;
          //   }
          //   var str = data.toString('base64');
          //   //do something
          //
          //   console.log(pat);
          // });
        }
        var data = ejs.render(template, {
          imgs: filestr,
          interval: 2000,
          width: 1200,
          height: 600,
          firstview: 0,
          rotation: true,
          speed: -30
        });
        fs.writeFileSync("thetaview.html",data);
      });
    form.parse(req);
  } else if (req.url.lastIndexOf('/view', 0) === 0){// .indexOf('/view/')>0) { // http://localhost:3000/view?cs=1419629829325&ce=1419629829325
    console.log('view');
    if(req.method=='GET') {
      var url_parts = url.parse(req.url,true);
      console.log(url_parts.query['cs'] + " - " + url_parts.query['ce']);
      var _interval = url_parts.query['i'] || 30000;
      var _width = url_parts.query['w'] || 1200;
      var _height = url_parts.query['h'] || 600;
      var _firstview = url_parts.query['f'] || 0;
      var _rotation = url_parts.query['r'] || true;
      var _speed = url_parts.query['sp'] || -15;
      db.getEntryByCtime(Number(url_parts.query['cs']),Number(url_parts.query['ce']),function(result){
        //console.log(result.length)
        var b64s = '';
        for(var i=0;i<result.length;i++){
          b64s += "'data:image/jpg;base64," + result[i].mini_image + "',";
        }
        b64s = b64s.substring(0,b64s.length-1);
        //console.log(b64s);
        var data = ejs.render(template, {
          imgs: b64s,
          interval: _interval,
          width: _width,
          height: _height,
          firstview: _firstview,
          rotation: _rotation,
          speed: _speed
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();

        // console.log('time : ' + JSON.stringify(result.time));
        // // console.log("image " + result.image); //**********
        // socket.emit('update_image_base64',result.image);
        // emitIosImage(socket, result.image);
      });
    }
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
