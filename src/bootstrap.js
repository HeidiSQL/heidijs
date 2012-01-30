//---Overrides---//
Ext.override(Ext.window.Window, {
	constrain:true
});


//---Create Connection Manager---//
Ext.onReady(function()	{
	//---Initialize Quick Tips---//
	Ext.QuickTips.init();


	//---Create New Connection Manager---//
	Heidi.window.ConnectionManager.bootstrap();
});