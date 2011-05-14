function switchdiv(divn,divs)
{
 var div=divs[divn]
 if(document.getElementById(div).style.display!='none') return;
 for(var x in divs)
 {
  document.getElementById(divs[x]).style.display='none';
 }
 document.getElementById(div).style.display='';
}

function val(id)
{
 return document.getElementById(id).value;
}
function set_modules_manager_result(str)
{
  document.getElementById("modules_manager_result").innerHTML = str;
}

function cmd(command_name,vars,result)
{
 var querystring="";
 if(vars)
 for(var x in vars)
 {
  querystring+=querystring==''?'':'&';
  querystring+=escape(x)+'='+escape(vars[x]);
 }
 get('http://'+location.host+'/'+command_name+(querystring==''?'':'?')+querystring,result);
}


function get(strURL,callback)
{
 var xmlhttp;
 if (window.XMLHttpRequest)
 {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
 }
 else
 {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
 }
 xmlhttp.onreadystatechange=function()
 {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
  {
   callback(xmlhttp.responseText);
  }
 }
 xmlhttp.open("GET",strURL,true);
 xmlhttp.send();
}

function post(strURL,vars,callback)
{
 var xmlhttp;
 if (window.XMLHttpRequest)
 {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
 }
 else
 {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
 }
 xmlhttp.onreadystatechange=function()
 {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
  {
   callback(xmlhttp.responseText);
  }
 }
 xmlhttp.open("POST",strURL,true);
 xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
 var querystring="";
 if(vars)
 for(var x in vars)
 {
  querystring+=querystring==''?'':'&';
  querystring+=escape(x)+'='+escape(vars[x]);
 }
 xmlhttp.send(querystring);
}

window.onresize=function()
{
 if(document.body)
  document.body.style.minHeight=((document.body.clientHeight||window.innerWidth)*0.9)+'px';
}
if(document.body)
 document.body.style.minHeight=((document.body.clientHeight||window.innerWidth)*0.9)+'px';
