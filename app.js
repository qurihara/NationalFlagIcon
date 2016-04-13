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


server = http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="title"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
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
        res.writeHead(200, {'content-type': 'text/html'});
        var vl = getViewerLink(now);
        res.write('Uploaded: <a href="' + vl + '" target="_blank">viewer link</a>');
        // res.write('received fields:\n\n '+util.inspect(fields));
        // res.write('\n\n');
        // res.end('received files:\n\n '+util.inspect(files));
        res.end();

        var filestr = '';
        for(var i =0;i<files.length;i++){
          var pat = files[i][1]['path'];
          filestr = filestr + "\t'" + files[i][1]['name'] + "',\n";
          fs.readFile(pat,function(err,data){
            if(err){
              return;
            }
            var str = data.toString('base64');

            console.log(pat);
            var child = exec(settings.exepath + " " + pat + " " + now, function(err, stdout, stderr) {
              if (!err) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr)
              } else {
                console.log(err);
                          // err.code will be the exit code of the child process
                          console.log(err.code);
                          //err.signal will be set to the signal that terminated the process
                          console.log(err.signal);
              }
            });
          });
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

function getViewerLink(date){
  return 'view?cs=' + date + '&ce=' + date + '&i=2000&w=1200&h=600&f=0&r=true&sp=-15';
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
