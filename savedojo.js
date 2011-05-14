// the folowing patches the _loadUri method, to collect script filenames to preload later, and sends a feedbak to server.
// the server later remembers the filenames and generates a single file for that url
// the result file is an object of urls and functions.
// based on the idea that functions are not executed they are just parsed.
// later i execute the functions on include

var dojopaths=[];
dojo._loadUri_orig=dojo._loadUri;
dojo._loadUri=function(uri,cb)
{
 var o={f:uri,cb:!!cb};
 if(dojo._scopePrefix) o.pf=dojo._scopePrefix;
 if(dojo._scopeSuffix) o.sf=dojo._scopeSuffix;
 dojopaths.push(o);
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
    if(console&&console.log)console.log('dojo preloaded saved');
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


