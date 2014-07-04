infinity.js
===============

infinity scroll page！！！

HTML5 Simulation of client pull down to refresh, pull load more.

At the same time, you can set the buffer parameters, to achieve clear DOM buffer area outside of the structure, to reduce memory consumption.


![demo](img/mask.jpg)


Here is an example:


 ``` js
var wall = new infinity("#wrap", {
    ajaxUrl: "data.json",             
    template: $('#tpl_timeline').html(),
    buffer: 1,               
    callback: function(content,index){
    	console.log(content);
    }           
});
```