(function()	{
	//---Private Variables---//
	var unsavedSessionName = "Unsaved Session";
	
	
	//---Create Singleton---//
	Heidi.window.ConnectionManager = Ext.create("Ext.window.Window", {
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
					selType:"cellmodel",
					listeners:{
						select:function(inSelModel, inRecord)	{
							var tabPanel = inSelModel.view.panel.nextSibling();
							
							tabPanel.items.each(function(inItem)	{
								if(inItem.xtype != "form")	{
									return true;
								}
								
								inItem.getForm().loadRecord(inRecord);
							});
						}
					}
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
						this.store.load();
					
						if(!this.store.getCount())	{
							this.store.add({
								name:unsavedSessionName
							});
						}
						
						this.selModel.setCurrentPosition({row:0, column:0});
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
									
									var values = form.getValues(),
										sessionsGrid = this.ownerCt.ownerCt.ownerCt.previousSibling(),
										selectedSession = sessionsGrid.store.getAt(sessionsGrid.getSelectionModel().getCurrentPosition().row),
										promptForUpdate = false,
										saveSessionsAndContinue = function()	{
											try	{
												sessionsGrid.store.sync();
												checkForPassword();
											}
											catch(e)	{
												Ext.MessageBox.alert("Warning", "Your sessions couldn't be saved.", checkForPassword);
											}
										},
										checkForPassword = function()	{
debugger;
										};
									
									Ext.Object.each(values, function(inKey, inValue)	{
										if(selectedSession.get(inKey) == inValue)	{
											return true;
										}
										
										promptForUpdate = true;
										return false;
									});
									
									if(promptForUpdate)	{
										return Ext.MessageBox.confirm("Save Session", "Do you want to save your changes before connecting?", function(inButton)	{
											if(inButton == "yes")	{
												Ext.Object.each(values, function(inKey, inValue)	{
													selectedSession.set(inKey, inValue);
												});
												
												if(selectedSession.get("name") == unsavedSessionName)	{
													return Ext.MessageBox.prompt("Session Name", "What would you like to name this session?", function(inButton, inValue)	{
														if(inButton == "ok")	{
															selectedSession.set("name", inValue);
														}
														
														saveSessionsAndContinue();
													}, Ext.MessageBox, false, selectedSession.get("hostname_ip"));
												}
											}
											
											if(inButton == "cancel")	{
												return false;
											}
											
											saveSessionsAndContinue();
										});
									}
									
									saveSessionsAndContinue();
								}
							},
							{
								text:"Reset",
								handler:function()	{
									this.ownerCt.ownerCt.getForm().reset();
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
})();