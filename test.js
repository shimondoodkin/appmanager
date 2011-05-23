var npm = require("npm");
function npm_get_data(cb)
{
 var npmConfig={
  //userconfig:__dirname+'/config.npm',
  //globalconfig:__dirname+'/config.npm',
  //prefix: process.cwd(),
  //global:true,
  outfd : null
 };
 npm.load(npmConfig, function (er)
 {
  if (er) return handlError(er)
  npm.commands.search([], function (er, data)
  {
   if (er) return commandFailed(er)
   // command succeeded, and data might have some info
   cb(data)
   //console.log("data:",Object.keys(data).length)
  });
  //npm.on("log", function (message) { /*console.log("message",message);*/ })
 });
}