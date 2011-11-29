Ext.define("Heidi.data.proxy.MySQLPHP", {
	extend:"Ext.data.proxy.Ajax",
	alias:"proxy.mysqlphp",
	
	url:"providers/data/proxy/MySQLPHP.php",
	establishConnection:function(inSessionRecord, inCallback)	{
		Ext.Ajax.request({
			url:this.url,
			params:{
				type:"establish_connection",
				params:Ext.encode(inSessionRecord.data)
			},
			success:function(inResponse)	{
debugger;
			}
		});
	},
	bindToConnection:function(inConnectionId)	{
		this.extraParams = Ext.apply(this.extraParams || {}, {
			connection_id:inConnectionId
		});
	}
});

Heidi.ProxyManager.register("MySQL (PHP)", Heidi.data.proxy.MySQLPHP);