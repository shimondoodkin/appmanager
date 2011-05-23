var npm = require("npm");


exports.ls=function (callback)
{
 var  child = exec('ls -la',
 function (error, stdout, stderr)
 {
  //console.log('stdout: ' + stdout);
  //console.log('stderr: ' + stderr);
  if (error !== null)
  {
   callback();
   console.log('exec error: ' + error);
  }
  else
  {
   callback(stdout);
  }
 });
}

exports.list=function (cb)
{
 var  child = exec('cd /;ls -la',
 function (error, stdout, stderr)
 {
  //console.log('stdout: ' + stdout);
  //console.log('stderr: ' + stderr);
  if (error !== null)
  {
   callback("");
   console.log('exec error: ' + error);
  }
  else
  {
   callback(stdout);
  }
 });
}



exports.npm_get_data=function (cb)
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
  if (er) throw er;
  npm.commands.search([], function (er, data)
  {
   if (er) throw er;
   cb(data);
   // command succeeded, and data might have some info
   //
   //console.log("data:",Object.keys(data).length)
  });
  //npm.on("log", function (message) { /*console.log("message",message);*/ })
 });
}