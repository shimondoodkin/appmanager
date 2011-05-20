var npm = require("npm");
var myConfigObject={
 userconfig:'/mnt/hda1/www/vot.me/node_modules/appmanager/npm-config',
 globalconfig:'/mnt/hda1/www/vot.me/node_modules/appmanager/npm-config',
 prefix:'/mnt/hda1/www/vot.me/'
};

npm.load(myConfigObject, function (er)
{
 if (er) return handlError(er)
 npm.commands.ls([], function (er, data)
 {
  if (er) return commandFailed(er)
  // command succeeded, and data might have some info
  console.log("data:",data)
 });
 npm.on("log", function (message) { console.log("message",message); })
})
