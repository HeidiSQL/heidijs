Ext.define("Heidi.window.ConnectionManager", {
	extend:"Ext.window.Window",

	iconCls:"icon-connection-manager",
	title:"Connection Manager",
	width:500,
	height:300,
	
	layout:{
		type:"hbox",
		pack:"start",
		align:"stretch"
	},
	items:[
		{
			xtype:"gridpanel",
			store:{
				proxy:{
					type:"localstorage",
					id:"HeidiJSConnectionManagerConnectionsProxy",
					reader:{
						type:"json"
					}
				},
				model:Ext.define("HeidiJSConnectionManagerConnectionModel", {
					extend:"Ext.data.Model",
					fields:[
						"connection_id",
						"name",
						"hostname_ip",
						"username",
						"password",
						"port",
						"create_date",
						"last_connect",
						"num_successful_connections",
						"num_unsuccessful_connections"
					]
				}) && "HeidiJSConnectionManagerConnectionModel"
			},
			columns:[
				{
					header:"Database Name",
					dataIndex:"name"
				}
			],
			flex:1
		}
	]
});