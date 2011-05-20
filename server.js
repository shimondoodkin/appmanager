var fs=require('fs'),
    path = require("path");

var http = require('http'),
    urlparse = require('url').parse;
    urlresolve = require('url').resolve;
var util = require('util'),
    exec = require('child_process').exec;

var linq             = require('jsinc').jsinc(__dirname+'/node_modules/jslinq/scripts/JSLINQ.js').window.JSLINQ;// http://jslinq.codeplex.com 
var linqjs           = require('jsinc').jsinc(__dirname+'/node_modules/linqjs/linq.js').Enumerable;             // http://linqjs.codeplex.com


var etag=Math.floor(Math.random()*11);

var tasks={};

function ls(callback)
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

function list(cb)
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

function checkfile(file)
{
 return  path.existsSync(file) && !fs.lstatSync(file).isDirectory();
}

// dojo save - make dojo work fast. by combining all modules into one.

     // many urls , same data. so we won't save same large data many times rather save it's hash.
var savedojo_url={};//  - pages  and its data md5 as data id
var savedojo_data={};//  - data by md5 sum of input
var md5= function(data){var h=require('crypto').createHash('md5');h.update(data);return h.digest('hex');};

function savedojo_makeset(host,url,md5val,bodyobj)
{
    savedojo_url[url]=md5val;
    var all=fs.readFileSync('savedojo_preloaded.js')+"\r\ndojo._preloadedUri={\r\n",file="",text="";
    for(var i=0;i<bodyobj.length;i++) 
    {
     var o=bodyobj[i];
     file=__dirname+'/node_modules'+(urlparse(urlresolve('http://'+host,o.f), true).pathname); // unsecure path should be urlresolve d before use
     if(checkfile(file))
     {
      text=fs.readFileSync(file).toString();
      //from dojo._loadUri
      if(o.cb)
      {
       text=/^define\(/.test(text)?text:"("+text+")";                                      // was parsed as var x=eval("(  {json:here}  )")
       all+=(i>0?',':'')+JSON.stringify(o.f)+':\r\n function(){return '+text+'} \r\n\r\n'; // various json objects. made it afunction so it will be simular to the second.
      }
      else
      {
        text='function(){'+(o.pf?o.pf:'')+text+(o.sf?o.sf:'')+'}';                       // was executed inside eval(...).
        all+=(i>0?',':'')+JSON.stringify(o.f)+':\r\n'+text+'\r\n\r\n';                   // a return is expected inside the code.         
      }
     }
    }
    all+="};";
    savedojo_data[md5val]=all;
}
function savedojo(req,url,q,send)
{
 url=url.substr(url.indexOf('/',8));
 if(req.method=='POST')//save files to cache and return ok
 {
  var body = '';
  req.on('data', function (data){body += data;});
  req.on('end', function ()
  {
   var bodyhash=md5(body);
   if(!savedojo_data[bodyhash])
   {
    console.log('dojo preloaded set saved');
    savedojo_makeset(req.headers.host,url,bodyhash,JSON.parse(body));
    console.log("\r\n add this to file to auto preload: \r\n savedojo_makeset('"+req.headers.host+"','"+url+"','"+bodyhash+"',"+body+");\r\n");
   }
   else 
    console.log('dojo preloaded set - already  saved, url='+url);
  });
 }
 else
 {
  if(savedojo_url[url]) { send(savedojo_data[savedojo_url[url]],'text/javascript',false,etag); }
  else                  { send(fs.readFileSync('savedojo.js'),'text/javascript');   }
 }
 //var data=q.data?q.data:[];
 //req.headers.referrer
}
// preload sets:
//savedojo_makeset('vot.me:2222','/','440e473a580316648f02399fadbd32a1',[{"f":"/dojo/1.6.1/dojo/../dojox/data/JsonRestStore.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/rpc/JsonRest.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/json/ref.js","cb":false},{"f":"/dojo/1.6.1/dojo/./date/stamp.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/rpc/Rest.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/data/ServiceStore.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/Tree.js","cb":false},{"f":"/dojo/1.6.1/dojo/./fx.js","cb":false},{"f":"/dojo/1.6.1/dojo/./fx/Toggler.js","cb":false},{"f":"/dojo/1.6.1/dojo/./DeferredList.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_Widget.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_WidgetBase.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/manager.js","cb":false},{"f":"/dojo/1.6.1/dojo/./Stateful.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/focus.js","cb":false},{"f":"/dojo/1.6.1/dojo/./window.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/place.js","cb":false},{"f":"/dojo/1.6.1/dojo/./AdapterRegistry.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/popup.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/window.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/scroll.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/sniff.js","cb":false},{"f":"/dojo/1.6.1/dojo/./uacss.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/typematic.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_base/wai.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_Templated.js","cb":false},{"f":"/dojo/1.6.1/dojo/./string.js","cb":false},{"f":"/dojo/1.6.1/dojo/./parser.js","cb":false},{"f":"/dojo/1.6.1/dojo/./cache.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_Container.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_Contained.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_CssStateMixin.js","cb":false},{"f":"/dojo/1.6.1/dojo/./cookie.js","cb":false},{"f":"/dojo/1.6.1/dojo/./regexp.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/tree/TreeStoreModel.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/tree/ForestStoreModel.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/tree/_dndSelector.js","cb":false},{"f":"/dojo/1.6.1/dojo/./dnd/common.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/tree/_dndContainer.js","cb":false},{"f":"/dojo/1.6.1/dojo/./dnd/Container.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/EnhancedGrid.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/DataGrid.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/nls/DataGrid_he.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/_PluginManager.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/_Events.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/_FocusManager.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/nls/he/EnhancedGrid.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/_SelectionPreserver.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/DnD.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/_Plugin.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/Selector.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/AutoScroll.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/Rearrange.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/_RowMapLayer.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/_StoreLayer.js","cb":false},{"f":"/dojo/1.6.1/dojo/./dnd/move.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/Menu.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/IndirectSelection.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/cells/dijit.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/DateTextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/Calendar.js","cb":false},{"f":"/dojo/1.6.1/dojo/./cldr/supplemental.js","cb":false},{"f":"/dojo/1.6.1/dojo/./date.js","cb":false},{"f":"/dojo/1.6.1/dojo/./date/locale.js","cb":false},{"f":"/dojo/1.6.1/dojo/./cldr/nls/he/gregorian.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dijit/form/DropDownButton.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/Button.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_HasDropDown.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/_DateTimeTextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/ValidationTextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/TextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/Tooltip.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/nls/he/validate.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dijit/form/TimeTextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_TimePicker.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/ComboBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/./data/util/simpleFetch.js","cb":false},{"f":"/dojo/1.6.1/dojo/./data/util/sorter.js","cb":false},{"f":"/dojo/1.6.1/dojo/./data/util/filter.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/nls/he/ComboBox.js","cb":true},{"f":"/dojo/1.6.1/dojo/./data/ItemFileReadStore.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/CheckBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/ToggleButton.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/NumberSpinner.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/_Spinner.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/NumberTextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/./number.js","cb":false},{"f":"/dojo/1.6.1/dojo/./cldr/nls/he/number.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dijit/form/CurrencyTextBox.js","cb":false},{"f":"/dojo/1.6.1/dojo/./currency.js","cb":false},{"f":"/dojo/1.6.1/dojo/./cldr/nls/he/currency.js","cb":true},{"f":"/dojo/1.6.1/dojo/./cldr/monetary.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/HorizontalSlider.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/Editor.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/RichText.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/selection.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/range.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/html.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/Toolbar.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/ToolbarSeparator.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/_Plugin.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/plugins/EnterKeyHandling.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_editor/nls/he/commands.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/Filter.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/nls/he/Filter.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/Dialog.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/Dialog.js","cb":false},{"f":"/dojo/1.6.1/dojo/./dnd/TimedMoveable.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/_FormMixin.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/_DialogMixin.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/DialogUnderlay.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/layout/ContentPane.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/layout/_ContentPaneResizeMixin.js","cb":false},{"f":"/dojo/1.6.1/dojo/./html.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/nls/he/common.js","cb":true},{"f":"/dojo/1.6.1/dojo/../dijit/TooltipDialog.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/FilterLayer.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/_FilterExpr.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/_DataExprs.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/_ConditionExpr.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/FilterBar.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/FilterDefDialog.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/Select.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/form/_FormSelectWidget.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/layout/AccordionContainer.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/layout/StackContainer.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/layout/StackController.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dijit/layout/AccordionPane.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/FilterBuilder.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/html/ellipsis.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/FilterStatusTip.js","cb":false},{"f":"/dojo/1.6.1/dojo/../dojox/grid/enhanced/plugins/filter/ClearFilterConfirm.js","cb":false}]);
//end dojo save


http.createServer(function (req, res)
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
 
 function sendfile(file,fmime)
 {
  if(req.headers['if-none-match'] == fs.lstatSync(file).mtime.getTime())
  {
   res.writeHead(304, { 'Content-Length': 0 });
   res.end(); return;
  }                            
  var ext=file.substr(file.lastIndexOf('.')+1).toLowerCase();
  var mime={html:'text/html', js:'text/javascript', css:'text/css', gif: 'image/gif', png: 'image/png', jpg: 'image/jpg', ico:'image/x-icon'};
  res.writeHead(200, {'ETag': fs.lstatSync(file).mtime.getTime(),'Content-Type': !!fmime?fmime: (mime[ext]?mime[ext]:mime['html'])});
  res.end(fs.readFileSync(file));
 }

 var match=null;
      if(url=='/index.html'||
         url=='/')            {  sendfile('index.html');}
 else if(url=='/index.css')   {  sendfile('index.css');}
 else if(url=='/close_html_tags_by_ident.js')    {  sendfile('close_html_tags_by_ident.js');}
 else if(url=='/index.js')    {  sendfile('index.js');}
 else if(url=='/favicon.ico') {  sendfile('favicon.ico');}
 else if(url=='/list')        {  list(send);}
 else if(url=='/install')     {  install(send);}
 else if(url=='/ls')          {  ls(send);}
 else if(url=='/savedojo.js') {  savedojo(req,req.headers.referer?req.headers.referer:'',q,send);}
 else if(match=url.match('^\/datastore(/.*)$'))   {  datastore(req,res,match[1]||"",q,send);}
 else if(url=='/grid.csv')    {  res.writeHead(200, {'Content-Type': 'text/csv'}); res.end(fs.readFileSync('grid-demo-data.csv'));}
 else if((match=url.match(/^\/CodeMirror2\/(.*$)/)) && checkfile(__dirname+'/node_modules/CodeMirror2/'+match[1])) { sendfile(__dirname+'/node_modules/CodeMirror2/'+match[1]); }
 else if((match=url.match(/^\/dojo\/(.*$)/)) && checkfile(__dirname+'/node_modules/dojo/'+match[1])) { sendfile(__dirname+'/node_modules/dojo/'+match[1]); }
 else if(url=='/exit')        {  send('ok'); process.exit(0);}
 else                         {  res.writeHead(404, {'Content-Type': 'text/plain'}); res.end("File Not Found\r\n"+match);}
 
}).listen(2222);
console.log('Server running at http://127.0.0.1:2222/');

var data={}


function datastore(req,res,url,q,send)
{
 var k=url.substr(1).split('/'); // remove first '/' and covert to array
 req.method=req.method.toUpperCase();
 if (req.method == 'GET' )
 {
  var value_start=0,value_end=24;
  //  = list databases and number of tables // i=
  // db = lista tables                      // i=0
  // db/table = all table items             // i=1
  // db/table/id = item                     // i=2
  var value=Object.keys(data),tdata=data,maybe_error=false,error=false; // i=
  for(var i=0;i<k.length;i++) // digg var
  {
   if(k[i].length==0) { maybe_error=true; continue; }
   else if (maybe_error) { error="empty name in request path"; break; }
   if(!tdata)  { error="object is undefined"; break; }
   if(k[i] in tdata)
   {
    if(i==0){  tdata=tdata[k[i]]; value=Object.keys(tdata);}
    else    {  tdata=tdata[k[i]]; value=tdata;}
   }
  }
  if(error)
   send(error+" url="+url,false,404);
  else
  {
   if(value instanceof Array)
   {
    //linq http://jslinq.codeplex.com/
    var query=(function (o) { function c(o) { for (var i in o) { this[i] = o[i]; } } return new c(o);})(q);
    
    var sort=false,desc=false;
    var match;
    for(x in query)
    {
     if(match=x.match(/^sort\((.+)\)$/))
     {
      sort=match[1];
      delete query[match[0]];
      sort=sort.split(',');
      sort=sort[0]||false; // we take just the first element no multi sort, this linq does not have multisort
      if(sort.charAt(0)=='-')
      {
       sort=sort.substr(1);
       desc=true;
      }
      else if(sort.charAt(0)==' ')
      {
       sort=sort.substr(1);
      }
     }
    }
    if(Object.keys(query).length==0)query=false;
    var filtered=false;
    if(query)
    {
     if(!filtered)var filtered=linq(value);
     filtered=filtered.Where(function(item)
     { 
      if(item)
      {
       var ok=true;
       for(x in query)
       {
        if(!(x in item)) 
        {
         ok=false;
         break;
        }
        if(item[x].toLowerCase().indexOf(query[x].toLowerCase())==-1)
        {
         ok=false;
         break;
        }
       }
       return ok;
      }
      else
       return false;
     });
    }
    if(sort)
    {
     if(!filtered)var filtered=linq(value);sort
     filtered=filtered[desc?'OrderByDescending':'OrderBy'](function(item) { return item[sort]; })
    }
    if(filtered)value=filtered.items;
    // end linq
    var value_range=req.headers['range']||"";
    if(value_range=value_range.match(/(\d+-\d+)/))
    {
     value_range=value_range[1].split("-");
     value_start=parseInt(value_range[0]);
     value_start=Math.min(value.length,Math.max(0,value_start));
     value_end=parseInt(value_range[1]);
     value_end=Math.min(value.length,value_end);
    }
    res.writeHead(200, {'Content-Type':'text/plain','Content-Range':'items '+value_start+'-'+value_end+'/'+value.length});
    res.end(JSON.stringify(value.slice(value_start,value_end+1)))
   } 
   else 
   {
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end(JSON.stringify(value));
   }
  }
 }
 if (req.method == 'DELETE' )
 {
  console.log("DELETE is not implemented",url,q,req.headers);  
 }
 if (req.method == 'PUT' || req.method == 'POST' )
 {
  var body = '';
  req.on('data', function (data)
  {
   body += data;
  });
  req.on('end', function ()
  {
   console.log("PUT or POST is not implemented",url,q,req.headers);
   console.log(body);
   // use POST
  });
 }
}

function shuffle(o){ //v1.0
for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};
var names="shi mon dood kin ga dol".split(" ");
data.db={tbl1:[]};
for(var i=0;i<100;i++)
{
 data.db.tbl1[i]={id:i,name:shuffle(names).slice(0,2).join(''),value:parseInt(Math.random() * 1000),grouptype:parseInt(Math.random() * 7)};
}
