Ext.define("Heidi.window.ConnectionManager", {
	extend:"Ext.window.Window",

	iconCls:"icon-connection-manager",
	title:"Connection Manager",
	width:500,
	height:300,
	
	layout:{
		type:"border",
		border:5
	},
	defaults:{
		split:true
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
						"proxy_type",
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
			width:150,
			region:"west",
			forceFit:true,
			selModel:{
				selType:"cellmodel"
			},
			plugins:[
				Ext.create("Ext.grid.plugin.CellEditing", {
					clicksToEdit:1
				})
			],
			dockedItems:[
				{
					xtype:"toolbar",
					dock:"bottom",
					items:[
						{
							text:"Add",
							iconCls:"icon-connection-manager-connections-add",
							handler:function()	{
debugger;
							}
						},
						{
							text:"Delete",
							iconCls:"icon-connection-manager-connections-delete",
							disabled:true,
							handler:function()	{
debugger;
							}
						}
					]
				}
			],
			listeners:{
				viewready:function()	{
					if(!this.store.getCount())	{
						this.store.add({
							name:"Unsaved Session"
						});
					}
					
debugger;
					this.getSelectionModel().select(this.store.getAt(0));
				}
			}
		},
		{
			xtype:"tabpanel",
			region:"center",
			defaults:{
				xtype:"form",
				bodyCls:"body-connection-manager-tab",
				defaults:{
					defaults:{
						anchor:"100%"
					}
				}
			},
			items:[
				{
					title:"Settings",
					iconCls:"icon-connection-manager-settings",
					
					defaults:{
						listeners:{
							afterrender:function()	{
								var connectButton = this.ownerCt.dockedItems.findBy(function(inDockedItem) { return inDockedItem.dock == "bottom"; }).items.findBy(function(inItem) { return inItem.connectButton; });
								
								Ext.create("Ext.util.KeyMap", this.el.dom.id, {
									key:Ext.EventObject.ENTER,
									fn:function()	{
										connectButton.handler();
									}
								});
							}
						}
					},
					items:[
						{
							xtype:"textfield",
							fieldLabel:"Hostname / IP",
							name:"hostname_ip",
							allowBlank:false
						},
						{
							xtype:"textfield",
							fieldLabel:"Username",
							name:"username",
							allowBlank:false
						},
						{
							xtype:"textfield",
							inputType:"password",
							fieldLabel:"Password",
							name:"password"
						},
						{
							xtype:"numberfield",
							fieldLabel:"Port",
							name:"port",
							minValue:1,
							maxValue:65536,
							value:3306,
							allowDecimals:false,
							allowBlank:false
						}
					],
					buttons:[
						{
							text:"Connect",
							connectButton:true,
							handler:function()	{
								var form = this.ownerCt.ownerCt.getForm();
								
								if(!form.isValid())	{
									return Ext.MessageBox.alert("Error", "Please complete the form before connecting.");
								}
								
								var values = form.getValues();
								
debugger;							
							}
						},
						{
							text:"Reset",
							handler:function()	{
debugger;
							}
						}
					]
				},
				{
					title:"Statistics",
					iconCls:"icon-connection-manager-statistics",
					defaults:{
						readOnly:true
					},
					items:[
						{
							xtype:"textfield",
							fieldLabel:"Created"
						},
						{
							xtype:"textfield",
							fieldLabel:"Last Connect"
						},
						{
							xtype:"numberfield",
							fieldLabel:"Successful Connections",
							name:"num_successful_connections"
						},
						{
							xtype:"numberfield",
							fieldLabel:"Unsuccessful Connections",
							name:"num_unsuccessful_connections"
						}
					]
				}
			]
		}
	]
});