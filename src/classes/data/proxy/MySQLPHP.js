Ext.define("Heidi.data.proxy.MySQLPHP", {
	extend:"Ext.data.proxy.Ajax",
	alias:"proxy.mysqlphp",
	
	url:"providers/data/proxy/MySQLPHP.php",
	establishConnection:function(inSessionRecord, inPassword, inCallback)	{
		Ext.Ajax.request({
			url:this.url,
			params:{
				flag:"establish_connection",
				params:Ext.encode(Ext.apply(Ext.apply({}, inSessionRecord.data), {password:inPassword}))
			},
			success:function(inResponse)	{
				var response = Ext.decode(inResponse.responseText);
				
				if(response.type == "error")	{
					return Ext.MessageBox.alert("Error", response.message, function()	{
						inCallback(false);
					});
				}
				
				inCallback(response.message);
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