#Readme


##Overview

My JOrgChart plugin is forked from [wesnolte/jOrgChart](https://github.com/wesnolte/jOrgChart).
I'm try to build a organisation chart of department that can parse json data,
and after drag-and-drop can generate json data.

![jQuery OrgChart](http://i.imgur.com/T8kKA.png "jQuery OrgChart")

----

##Expected Markup & Example Usage

To get up and running you'll need a few things. 

-----

###The JavaScript Libraries & CSS

You need to include the jQuery as well as the jOrgChart libraries. For example:

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.jOrgChart.js"></script>
	
If you want to use the drag-and-drop functionality you'll need to include jQuery UI too:

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.min.js"></script>
	
The core CSS is necessary to perform some of the basic styling i.e.

    <link rel="stylesheet" href="css/jquery.jOrgChart.css"/>

----

###The HTML

Just need a div tag

<div id="chart"></div>

-----

###The Json Data Format

You'll need to construct a json fromat data. For example:

[{"name":"TE","code":"G370","key":"1","parent":"0"},
{"name":"SSD","code":"AD60","key":"2","parent":"1"},
{"name":"DPM","code":"AD61","key":"3","parent":"2"},
{"name":"MDWSS","code":"AD72","key":"6","parent":"1"},
{"name":"ESW","code":"AD62","key":"4","parent":"6"},
{"name":"MDWD","code":"AD71","key":"5","parent":"6"}]


-----

###The jQuery Call

And the cherry on the top is the usual call, often but not always on document load. You'll need to specify the Id of the list in this call. For example:

	 $("#chart").jOrgChart({
         	jsonData: data,
                dragAndDrop: true
         });
	
This call will append the markup for the OrgChart to the `<body>` element by default, but you can specify this as part of the options.

----

###Read Json Data  

$("#chart").jOrgChart("jsonData")

------


##Configuration

There are only 3 configuration options.

1. **chartElement** - used to specify which HTML element you'd like to append the OrgChart markup to. *[default='body']*
2. **depth** - tells the code what depth to parse to. The default value of "-1" instructs it to parse like it's 1999. *[default=-1]*
3. **chartClass** - the name of the style class that is assigned to the generated markup. *[default='jOrgChart']*
4. **dragAndDrop** - determines whether the drag-and-drop feature of tree node elements is enabled. *[default=false]*
5. **jsonData** - the json data to be parse. *[default=false]*

