(function()	{
	//---Private Variables---//
	var unsavedSessionName = "Unsaved Session",
		dateFormat = "n/j/Y g:i:s A T",
		connectionIdXRecord = {},
		connectionIdXProxyInstance = {};
	
	
	//---Private Functions---//
	function getProxyInstanceFromConnectionId(inConnectionId)	{
		var proxyInstance = connectionIdXProxyInstance[inConnectionId];
		if(!proxyInstance)	{
			var record = connectionIdXRecord[inConnectionId];
			if(!record)	{
				return false;
			}
			
			proxyInstance = connectionIdXProxyInstance[proxyInstance] = Heidi.ProxyManager.create(record.get("proxy_type"));
		}
		
		return proxyInstance;
	};
	
	function establishConnectionWithIdAndRecord(inConnectionId, inConnectionRecord)	{
		Heidi.window.ConnectionManager.connectionEstablished(inConnectionRecord, inConnectionId);
		Heidi.window.ConnectionManager.hide();
		Heidi.container.Viewport.addConnection(inConnectionId);
	}
	
	
	//---Create Singleton---//
	Heidi.window.ConnectionManager = Ext.create("Ext.window.Window", {
		iconCls:"icon-connection-manager",
		title:"Connection Manager",
		width:500,
		height:300,
		modal:true,
		
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
							"id",
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
								id:new Date().getTime(),
								name:unsavedSessionName,
								create_date:Ext.Date.format(new Date(), dateFormat),
								num_successful_connections:0,
								num_unsuccessful_connections:0,
								port:3306
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
							anchor:"100%",
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
								xtype:"combobox",
								fieldLabel:"Type",
								name:"proxy_type",
								displayField:"proxyName",
								valueField:"proxyName",
								queryMode:"local",
								store:{
									proxy:{
										type:"memory",
										reader:{
											type:"json"
										}
									},
									model:Ext.define("HeidiConnectionManagerProxyTypeModel", {
										extend:"Ext.data.Model",
										fields:[
											"proxyName"
										]
									}) && "HeidiConnectionManagerProxyTypeModel"
								},
								listeners:{
									afterrender:function()	{
										var storeData = [];
										
										Ext.Array.each(Heidi.ProxyManager.getNames(), function(inProxyName)	{
											storeData.push({
												proxyName:inProxyName
											});
										});
										
										this.store.loadData(storeData);
									},
									change:function()	{
										if(this.store.getCount() == 1)	{
											var firstValue = this.store.data.get(0).get(this.valueField);
											if(this.getValue() != firstValue)	{
												this.select(firstValue);
											}
										}
									}
								}
							},
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
										password = false,
										checkForPassword = function()	{
											password = selectedSession.get("password");
											
											if(!password)	{
												var passwordWindow = Ext.create("Ext.window.Window", {
													title:"Password",
													width:400,
													height:100,
													modal:true,
													layout:"fit",
													items:[
														{
															xtype:"form",
															border:false,
															bodyCls:"body-connection-manager-password-window",
															items:[
																{
																	xtype:"textfield",
																	fieldLabel:"Password",
																	name:"password",
																	inputType:"password",
																	anchor:"100%",
																	listeners:{
																		afterrender:function()	{
																			var me = this,
																				connectButton = me.ownerCt.ownerCt.dockedItems.findBy(function(inDockedItem) { return inDockedItem.dock == "bottom"; }).getComponent(0);
																		
																			this.focus();
																		
																			Ext.create("Ext.KeyMap", me.el.dom.id, {
																				key:Ext.EventObject.ENTER,
																				fn:function()	{
																					connectButton.handler();
																				}
																			});
																			
																		}
																	}
																}
															]
														}
													],
													buttons:[
														{
															text:"Connect",
															handler:function()	{
																var form = this.ownerCt.ownerCt.getComponent(0).getForm();
																
																if(!form.isValid())	{
																	return Ext.MessageBox.alert("Error", "Please enter a password.", function()	{
																		form.getFields().get(0).focus();
																	});
																}
																
																password = form.getValues().password;
																passwordWindow.hide();
																connectToServer();
															}
														}
													]
												});
												
												return passwordWindow.show();
											}
											
											connectToServer();
										},
										connectToServer = function()	{
											var proxyType = selectedSession.get("proxy_type"),
												proxy = Heidi.ProxyManager.create(proxyType);
										
											Ext.MessageBox.wait("Please wait while connecting to the server...", "Connecting");
											
											proxy.establishConnection(selectedSession, password, function(inConnectionId)	{
												Ext.MessageBox.hide();
											
												if(!inConnectionId)	{
													Heidi.window.ConnectionManager.connectionRejected(selectedSession);
													return false;
												}
												
												establishConnectionWithIdAndRecord(inConnectionId, selectedSession);
											});
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
							readOnly:true,
							anchor:"100%"
						},
						items:[
							{
								xtype:"textfield",
								fieldLabel:"Created",
								name:"create_date"
							},
							{
								xtype:"textfield",
								fieldLabel:"Last Connect",
								name:"last_connect"
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
		],
		
		connectionEstablished:function(inRecord, inConnectionId)	{
			inRecord.set("last_connect", Ext.Date.format(new Date(), dateFormat));
			inRecord.set("num_successful_connections", inRecord.get("num_successful_connections") + 1);
			
			connectionIdXRecord[inConnectionId] = inRecord;
			
			Ext.util.Cookies.set("heidi-connectionmanager-last-connection-id", inConnectionId);
			Ext.util.Cookies.set("heidi-connectionmanager-last-connection-name", inRecord.get("name"));
			
			inRecord.store.sync();
		},
		connectionRejected:function(inRecord)	{
			inRecord.set("num_unsuccessful_connections", inRecord.get("num_unsuccessful_connections") + 1);
			
			inRecord.store.sync();
		},
		
		getConnectionInformation:function(inConnectionId)	{
			var record = connectionIdXRecord[inConnectionId];
			if(!record)	{
				return false;
			}
			
			var proxyType = record.get("proxy_type");
		
			return {
				connectionId:inConnectionId,
				name:record.get("name"),
				proxyType:proxyType,
				proxyConnectionTreeNodeIconCls:Heidi.ProxyManager.getConnectionTreeNodeIconClsFromProxyType(proxyType)
			};
		},
		getProxyInstanceFromConnectionId:function(inConnectionId)	{
			var proxyInstance = getProxyInstanceFromConnectionId(inConnectionId);
			if(!proxyInstance)	{
				return false;
			}
			proxyInstance.bindToConnection(inConnectionId);
			
			return proxyInstance;
		},
		getAllCompatibleTabsNamesFromConnectionId:function(inConnectionId)	{
			var proxyInstance = getProxyInstanceFromConnectionId(inConnectionId);
			if(!proxyInstance)	{
				return false;
			}
			
			return proxyInstance.getCompatibleTabNamesFromNodeType("ALL");
		},
		getCompatibleTabsFromTreeNode:function(inTreeNode)	{
			var proxyInstance = getProxyInstanceFromConnectionId(inTreeNode.get("connectionId"));
			if(!proxyInstance)	{
				return false;
			}
			
			return proxyInstance.getCompatibleTabNamesFromNodeType(inTreeNode.get("type"));
		},
		
		bootstrap:function()	{
			//---Variables---//
			var me = this;
		
		
			//---Check Last Connetion---//
			var lastConnectionId = Ext.util.Cookies.get("heidi-connectionmanager-last-connection-id");
			if(lastConnectionId)	{
				return Ext.MessageBox.confirm("Restore Last Connection", "Do you want to restore the last connection?", function(inButton)	{
					if(inButton != "yes")	{
						return me.show();
					}
					
					Ext.getBody().mask("Loading...");
					
					var connectionsStore = me.getComponent(0).store;
					connectionsStore.load({
						callback:function()	{
							var lastConnectionName = Ext.util.Cookies.get("heidi-connectionmanager-last-connection-name"),
								lastConnectionRecordIndex = connectionsStore.findBy(function(inRecord) { return inRecord.get("name") == lastConnectionName; });
							if(!lastConnectionRecordIndex == -1)	{
								Ext.getBody().unmask();
							
								return Ext.MessageBox.alert("Error", "Unable to find reference to last connection.", function()	{
									me.show();
								});
							}
					
							var lastConnectionRecord = connectionsStore.getAt(lastConnectionRecordIndex),
								lastConnectionProxyType = lastConnectionRecord.get("proxy_type"),
								proxy = Heidi.ProxyManager.create(lastConnectionProxyType);
							proxy.reestablishConnection(lastConnectionId, function(inConnectionId)	{
								Ext.getBody().unmask();
							
								if(!inConnectionId)	{
									Ext.util.Cookies.clear("heidi-connectionmanager-last-connection-id");
									Ext.util.Cookies.clear("heidi-connectionmanager-last-connection-name");
									return me.show();
								}
								
								establishConnectionWithIdAndRecord(inConnectionId, lastConnectionRecord);
							});
						}
					});
				});
			}
		
			this.show();
		}
	});
})();