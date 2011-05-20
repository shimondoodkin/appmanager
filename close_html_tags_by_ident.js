/*
<scr ipt type="text/x-template" id="t1">
     
<!DOCTYPE html>
<html lang="en">
 <head>
  <title>title
  <body>
    <h1>Jade - node template engine</h1>
    <div id="container">
      <p>You are amazing
      <script language="javascript">
       as is
      </script>
      <p>
        foo
        <i>bah
        baz
      </p>
        
</scr ipt><scr ipt type="text/javascript">write_close_html_tags_by_ident(document.getElementById('t1').innerHTML);</scr ipt>
*/

function close_html_tags_by_ident( html )
{
 var as_is_tags=['script','textarea','style'];
 var no_close_tags=['script','textarea','style'];
 var re={
        opentag:/\<(\w+)( .*)?(?!\/)\>/im,
        closetag:/\<(\w+)[\s\n\r]*\>/im,
        ident:/^[\s\r\n]+/i,
        lastspace:/[\s\n\r]+$/m
       },
     re_tags={};
       
 var lines=html.split("\n");  // split
 for(var i=0;i<lines.length-1;i++) lines[i]+="\n"; // add newlines at the end, there is never a newline at the end.
 var tagpos,prefix_space,ret="",line,tag,no_close_tag,tags=[],space=[],skip=0,linesToSkip;;
 for(var i=0;i<lines.length;i++)
 {
  line=lines[i];
  tagpos=line.indexOf('<');
  prefix_space=line.match(re.ident);prefix_space=prefix_space?prefix_space[0]:'';
  if(tagpos==-1)
  {
   ret+=line;
  } 
  else if(tagpos==prefix_space.length)// it is a tag
  {
   if(tags.length>tagpos)// do we have anything to close
   {
    for(var closetag_pos=tags.length-1;closetag_pos>=tagpos;closetag_pos--) // close tags left to close, usually just 1 loop
    {
     if(tags[closetag_pos])
     {
      suffix_space_len=(ret.match(re.lastspace)||[""])[0].length;
      ret=ret.substr(0,ret.length-suffix_space_len)+  "</"+tags[closetag_pos]+">"  +ret.substr(ret.length-suffix_space_len);
     }
    }
    if(tags.length>tagpos)tags.slice(0,tagpos-1);// // prevent 'close tags left unclosed' on tags alrady that are closed
   }
   tag=line.match(re.opentag);
   no_close_tag=!!tag[2];
   tag=tag[1];
   closeTagPos=-1;//init
   if(tag in as_is_tags)
   {
    if(! (tag in re_tags))re_tags[tag]=new RegExp("\\<\\/"+tag+"[\\s\\n\\r]*\\>","im"); // cache close tag regexp for some tag
    closeTagPos=html.substr(skip).search(re_tags[tag]); // search for a close tag
    if(closeTagPos!=-1)// close tag not found?, then a take a full text of the tag
    {
     linesToSkip=html.substr(skip,closeTagPos).split("\n").length-1;
     for(var k=0;k<=linesToSkip;k++)
      ret+=line[i+k];
     i+=linesToSkip;
    }
   }
   else
   {
    ret+=line; // add the text of the line
    // should it add a close tag for later?
    if(!no_close_tag)// no need to for close tag, tag like <img />  
    {
     if(closeTagPos==-1)//should search a for a close tag?
     {
      if(! (tag in re_tags))re_tags[tag]=new RegExp("\\<\\/"+tag+"[\\s\\n\\r]*\\>","im"); // cache close tag regexp for some tag
      closeTagPos=html.substr(skip).search(re_tags[tag]); // search for a close tag
     }
     if(closeTagPos==-1)// close tag not found?, then a tag should be closed
     {
      space[tagpos]=prefix_space;
      tags[tagpos]=tag;
     }
    }
   }
  }
  else
   ret+=line;
  skip+=line.length;
 }
 // close tags left unclosed
 for(var i=tags.length-1;i>=0;i--)
 {
  if(tags[i])
   ret+=space[i]+"</"+tags[i]+">";
 }
 return ret;
}

function write_close_html_tags_by_ident(x,debug)
{
 if(!debug)
  document.write(close_html_tags_by_ident(x));
 else
  document.write("<textarea  cols=20 rows=10 wrap='off'>"+x+'\r\n----\r\n'+close_html_tags_by_ident( x )+"</textarea>");
}