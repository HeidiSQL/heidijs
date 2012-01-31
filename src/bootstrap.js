//---Overrides---//
Ext.override(Ext.window.Window, {
	constrain:true
});


//---Interceptors---//
Ext.apply(Ext.selection.CellModel.prototype, {
	onMouseDown:Ext.Function.createInterceptor(Ext.selection.CellModel.prototype.onMouseDown, function(inView, inCell, InCellIndex, inRecord, inRow, inRowIndex, inEvent)	{
		inView.lastMouseDownEvent = inEvent; // The cell model does not pass the event on the select event. Needed by the table editor's Defaults column.
	})
});


//---Create Connection Manager---//
Ext.onReady(function()	{
	//---Initialize Quick Tips---//
	Ext.QuickTips.init();


	//---Create New Connection Manager---//
	Heidi.window.ConnectionManager.bootstrap();
});