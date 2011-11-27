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