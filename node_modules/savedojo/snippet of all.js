function savedojo_client1()
{
// the folowing patches the _loadUri method, to collect script filenames to preload later, and sends a feedbak to server.
// the server later rtemembers the filenames and generates a single file for that url
var dojopaths=[];
dojo._loadUri_orig=dojo._loadUri;
dojo._loadUri=function(uri,cb)
{
 dojopaths.push({f:uri,cb:!!cb,pf:dojo._scopePrefix,sf:dojo._scopeSuffix});
 return dojo._loadUri_orig(uri,cb); 
};

function senddojopaths()
{
 //alert('1load');
 setTimeout(function(){
  var xhrArgs =
  {
   url: "/savedojo.js",
   postData: JSON.stringify(dojopaths),
   handleAs: "text",
   load: function(data)
   {
    //alert('1done');
   },
   error: function(error)
   {
    //alert('1err');
   }
  }
  var deferred = dojo.xhrPost(xhrArgs);
 },1500);
}
dojo.addOnLoad(senddojopaths);
}

function savedojo_client2()
{
// the folowing patches the _loadUri method, to not download and use preloaded scripts.
var d=dojo;
d._loadUri_orig=d._loadUri;
d._loadUri=function (uri,cb)
{
 if(!(uri in d._preloadedUri))
  return _loadUri_orig(uri,cb);
 else
 {
  if(d._loadedUrls[uri])
  {
   return true;
  }
  d._inFlightCount++;
  var _23=d._preloadedUri[uri];
  if(_23)
  {
   d._loadedUrls[uri]=true;
   d._loadedUrls.push(uri);
   var _24=_23;
   if(cb)
   {
    cb(_24);
   }
  }
  if(--d._inFlightCount==0&&d._postLoad&&d._loaders.length)
  {
   setTimeout(function()
    {
     if(d._inFlightCount==0)
     {
      d._callLoaded();
     }
    },0);
  }
  return !!_23;
 }
}
}


function savedojo_server()
{
// the composes a script to be preloaded from a feedback sent from 1st usage script. 
/*
function checkfile(file)
{
 return  path.existsSync(file) && !fs.lstatSync(file).isDirectory();
}
*/
var savedojo_url={};
var savedojo_data={};
var md5= function(data){var h=require('crypto').createHash('md5');h.update(data);return h.digest('hex');};
function savedojo(req,url,q,send)
{
 url=url.substr(url.indexOf('/',8));
 if(req.method=='POST')//save files to cache and return ok
 {
  var body = '';
  req.on('data', function (data){body += data;});
  req.on('end', function ()
  {
   savedojo_url[url]=md5(body);
   var h=savedojo_url[url];
   if(!savedojo_data[h])
   {
    //console.log(body);
   
    var paths=JSON.parse(body);
    // /(^[\/]{2}[^\n]*)¦([\n]{1,}[\/]{2}[^\n]*)/g;
    
    var all="dojo.__prevent_load=true;dojo._preloadedUri={\r\n",file="",text="";
    for(var i=0;i<paths.length;i++) 
    {
     file=__dirname+'/node_modules'+(urlparse(urlresolve('http://'+req.headers.host,paths[i].f), true).pathname); // unsecure path should be urlresolve d before use
     if(checkfile(file))
     {
      text=fs.readFileSync(file).toString();
      //from dojo._loadUri
      if(paths[i].cb)
      {
       text=/^define\(/.test(text)?text:"("+text+")";
       all+=(i>0?',':'')+JSON.stringify(paths[i].f)+':\r\n'+text+'\r\n\r\n';
      }
      else
      {
        text='function(){'+paths[i].pf+text+paths[i].pf+'}()';
        all+=(i>0?',':'')+JSON.stringify(paths[i].f)+':\r\n'+text+'\r\n\r\n';
      }
     }
    }
    all+="}";
    savedojo_data[h]=all;
   }
   send('saved');
  });
 }
 else
 {
  if(savedojo_url[url]) { send(savedojo_data[savedojo_url[url]],'text/javascript'); }
  else                  { send(fs.readFileSync('savedojo.js'),'text/javascript');   }
 }
 //var data=q.data?q.data:[];
 //req.headers.referrer
}
}

