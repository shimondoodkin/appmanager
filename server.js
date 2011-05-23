var fs=require('fs'),
    path = require("path");

var http = require('http'),
    urlparse = require('url').parse;
    urlresolve = require('url').resolve;
var util = require('util'),
    exec = require('child_process').exec;
var datastore=require('dojo_rest_datastore');

var functions = require('./functions.js');

var etag=Math.floor(Math.random()*11);

var tasks={};

var data={};

//load some data
// npm data
data.npm={'loading, not loaded yet':{name:'loading, not loaded yet'}};
function set_data(key,value){data[key]=value}
functions.npm_get_data(function checkfile(data){set_data('npm',data);});
// table with random data 
var names="shi mon dood kin ga dol".split(" ");
data.tbl1=[{id:1,name:'no rows yet'}];
function shuffle(o){for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);return o;};
for(var i=0;i<100;i++){data.tbl1[i]={id:i,name:shuffle(names).slice(0,2).join(''),value:parseInt(Math.random() * 1000),grouptype:parseInt(Math.random() * 7)};}

function checkfile(file)
{
 return  path.existsSync(file) && !fs.lstatSync(file).isDirectory();
}

var nowjs = require('now');
var everyone ;

var recache={};
var httpserver=http.createServer(function (req, res)
{
 var u=urlparse(urlresolve('http://'+req.headers.host,req.url), true), url=u.pathname, q=u.query;
 //console.log('req',require('sys').inspect(req));
 //console.log('url',require('sys').inspect(q));

 function send(str,mime,status,etag)
 {
  if(etag && req.headers['if-none-match'] == etag)
  {
   res.writeHead(304, { 'Content-Length': 0 });
   res.end(); return;
  }
  res.writeHead(status?status:200, etag?{'ETag': etag,'Content-Type': mime?mime:'text/plain'}:{'Content-Type': mime?mime:'text/plain'});
  res.end(str);
 }
 
 function sendfile(file,fmime,expiers)
 {
  // there is a suggestion to remove etags when setting expiers
  //if(!expiers) 
  if(req.headers['if-none-match'] == fs.lstatSync(file).mtime.getTime())
  {
   res.writeHead(304, { 'Content-Length': 0 });
   res.end(); return;
  }
  var ext=file.substr(file.lastIndexOf('.')+1).toLowerCase();
  var mime={html:'text/html', js:'text/javascript', css:'text/css', gif: 'image/gif', png: 'image/png', jpg: 'image/jpg', ico:'image/x-icon'};
  var header=
  {
   'Content-Type': !!fmime?fmime: (mime[ext]?mime[ext]:mime['html'])
  };
  
  //if(!expiers)
  header['ETag']=fs.lstatSync(file).mtime.getTime();

  if(expiers)
  {
   header['Cache-Control']="max-age="+expiers;
   //var d=(new Date),x=d.getTime();d.setTime(x+expiers);
   //header['Expires']=d.toGMTString();
  }
  res.writeHead(200, header);
  res.end(fs.readFileSync(file));
 }
 
 function senddir(dirname,targetdir)
 {
  var tre="^\\/"+dirname+"\\/(.*$)";
  re=(tre in recache)?recache[tre]:(recache[tre]=new RegExp(tre));
  if((match=url.match(re)) && checkfile(__dirname+'/'+targetdir+'/'+match[1]))
  {
   sendfile(__dirname+'/'+targetdir+'/'+match[1],false,60*60*24);
   return true;
  }
  else
   return false;
 }

 var match=null;
      if(url=='/index.html'||
         url=='/')            {  sendfile('index.html');}
 else if(url=='/index.css')   {  sendfile('index.css');}
 else if(url=='/index.js')    {  sendfile('index.js');}
 else if(url=='/favicon.ico') {  sendfile('favicon.ico',false,60*60*24);}
 else if(url=='/list')        {  functions.list(send);}
 else if(url=='/install')     {  functions.install(send);}
 else if(url=='/ls')          {  functions.ls(send);}
 //else if(url=='/savedojo.js') {  savedojo(req,req.headers.referer?req.headers.referer:'',q,send);}
 else if(match=url.match('^\/data(/.*)$'))   {  datastore(data,req,res,match[1]||"",q,send);}
 else if(senddir('CodeMirror2','node_modules/CodeMirror2')) ;
 else if(senddir('dojo','node_modules/dojo')) ;
 else if(senddir('jquery','node_modules/jquery')) ;
 else if(senddir('yui','node_modules/yui')) ;
 else if(url=='/exit')        {  send('ok'); process.exit(0);}
 else                         {  res.writeHead(404, {'Content-Type': 'text/plain'}); res.end("File Not Found\r\n"+match);}
 
});
everyone = nowjs.initialize(httpserver);
httpserver.listen(2222);
everyone.now.distributeMessage = function(message){everyone.now.receiveMessage(this.now.name, message);};

console.log('Server running at http://127.0.0.1:2222/');


