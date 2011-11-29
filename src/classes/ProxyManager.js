(function()	{
	var proxies = {};
	
	Heidi.ProxyManager = {
		register:function(inTypeName, inClassName)	{
			proxies[inTypeName] = inClassName;
		},
		create:function(inTypeName)	{
			return Ext.create(proxies[inTypeName]);
		},
		
		getNames:function()	{
			return Ext.Object.getKeys(proxies);
		}
	};
})();