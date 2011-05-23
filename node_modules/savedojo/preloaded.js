// the folowing patches the _loadUri method, to not download and use preloaded scripts.
var d=dojo;
d._loadUri_orig=d._loadUri;
d._loadUri=function (uri,cb)
{
 if(!(d._preloadedUri&&uri in d._preloadedUri))
  return d._loadUri_orig(uri,cb);
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
   var _24=_23();//eval
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
