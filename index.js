
$(document).ready(function(){
  
  now.name = prompt("What's your name?", "");  
  now.receiveMessage = function(name, message){
    $("#messages").append("<br>" + name + ": " + message);
  }
  
  $("#send-button").click(function(){
    now.distributeMessage($("#text-input").val());
    $("#text-input").val("");
  });
  
});

function val(id)
{
 return document.getElementById(id).value;
}

function set_modules_manager_result(str)
{
  var d=document.createElement('textarea');
  d.innerHTML = str;
  d.style.position='absolute';
  d.style.backgroundColor='#fff';
  d.style.border='1px solid black';
  d.style.padding='20px';
  d.style.top='5%';
  d.style.left='25%';
  d.style.width='50%';
  d.title="double click to close";
  d.ondblclick=function(){ var x=this.parentNode.removeChild(this);delete x;}
  document.body.appendChild(d);
  return str;
  //document.getElementById("xhr_result").innerHTML = str;
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
