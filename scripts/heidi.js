/*	HeidiJS (Version: 0.0.12)
	Generated: 11/27/2011 09:27:42 PM UTC
*/

/*=====src/classes/viewport/Viewport.js=====*/
Ext.namespace("Heidi.viewport");


/*=====src/classes/window/ConnectionManager.js=====*/
Ext.namespace("Heidi.window");
Ext.define("Heidi.window.ConnectionManager", {
	extend:"Ext.window.Window",

	iconCls:"icon-connection-manager",
	title:"Connection Manager",
	width:500,
	height:300
});

/*=====src/bootstrap.js=====*/
//---Overrides---//
Ext.override(Ext.window.Window, {
	constrain:true
});


//---Create Connection Manager---//
Ext.onReady(function()	{
	//---Create New Connection Manager---//
	var connectionManager = Ext.create("Heidi.window.ConnectionManager");
	connectionManager.show();
});