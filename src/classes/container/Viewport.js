Ext.onReady(function()	{
	//---Constants---//
	var CENTER_BORDER_LAYOUT_PADDING = "5 0 5 0",
		CONNECTIONS_TREE_PANEL_MODEL_NAME = "HeidiViewportConnectionsTreePanelModel";


	//---Connections TreePanel---//
	var connectionsTreePanelProxy = Ext.create("Ext.data.proxy.Memory", {
		read:function(inOperation, inCallback, inScope)	{
			//---Prevent Root Loading---//
			if(inOperation.node.get("id") == "root")	{
				return false;
			}
			
			
			//---Create Connection Proxy---//
			var connectionId = inOperation.node.get("connectionId"),
				nodeProxyInstance = Heidi.window.ConnectionManager.getProxyInstanceFromConnectionId(connectionId);
				canLoadChildren = nodeProxyInstance.loadConnectionChildren(inOperation.node, function(inChildren)	{
					Ext.Array.each(inChildren, function(inChild)	{
						inChild.proxyInstance = nodeProxyInstance;
					});
				
					inOperation.records = inChildren;
					inOperation.setCompleted(); // Needed so Ext will continue
					inOperation.setSuccessful();
					
					inCallback.apply(inScope || this, [inOperation]);
				});
			
			if(!canLoadChildren)	{
				return Ext.MessageBox.alert("Error", "Your request could not be processed. Error Code: ccV24");
			}
		},
		reader:{
			type:"json"
		}
	});
	
	if(!Ext.ModelManager.getModel(CONNECTIONS_TREE_PANEL_MODEL_NAME))	{
		Ext.define(CONNECTIONS_TREE_PANEL_MODEL_NAME, {
			extend:"Ext.data.Model",
			fields:[
				"id",
				"connectionId",
				"type",
				"text",
				"iconCls",
				"proxyInstance"
			]
		});
	}
	
	var connectionsTreePanel = Ext.create("Ext.tree.Panel", {
		region:"west",
		width:250,
		padding:CENTER_BORDER_LAYOUT_PADDING,
		store:{
			xtype:"treestore",
			model:CONNECTIONS_TREE_PANEL_MODEL_NAME,
			proxy:connectionsTreePanelProxy
		},
		useArrows:true,
		rootVisible:false,
		singleExpand:true,
		listeners:{
			itemclick:function(inView, inRecord)	{
				connectionTabPanel.syncTabsWithTreeNode(inRecord);
			}
		}
	});
	
	
	//---Connection Tab Panel---//
	var connectionTabPanel = Ext.create("Ext.tab.Panel", {
		region:"center",
		padding:CENTER_BORDER_LAYOUT_PADDING,
		
		syncTabsWithTreeNode:function(inTreeNode)	{
			var compatibleTabNames = Heidi.window.ConnectionManager.getCompatibleTabsFromTreeNode(inTreeNode);
			
			this.items.each(function(inTab)	{
				var isCompatible = inTab.isCompatible(compatibleTabNames);
				
				if(isCompatible)	{
					inTab.tab.show();
					
					if(!inTab.needsToSyncWithTreeNode || inTab.needsToSyncWithTreeNode(inTreeNode))	{
						inTab.syncWithTreeNode(inTreeNode);
					}
				}
				else	{
					inTab.tab.hide();
				}
			});
		}
	});
	
	
	//---Create Status Panel---//
	var statusPanel = (function()	{
		var numStatusMessages = 0,
			nextPaddingIncrement = 1;
		
		return Ext.create("Ext.panel.Panel", {
			region:"south",
			height:150,
			resizable:true,
			autoScroll:true,
			html:"<ol class='viewport-status-panel-list'></ol>",
			dockedItems:[
				{
					xtype:"toolbar",
					dock:"bottom",
					items:[
						{
							text:"Status"
						}
					]
				}
			],
			
			appendStatusMessage:function(inMessage, inType)	{
				//---Append Message---//
				var list = statusPanel.body.dom.firstChild,
					newStatus = document.createElement("li");
				
				newStatus.innerHTML = "<div class='viewport-status-panel-item-" + inType + "'>" + inMessage + "</div>";
				list.appendChild(newStatus);
				this.body.scroll("bottom", 1000);
				
				
				//---Increment Counter---//
				numStatusMessages++;
				
				if(numStatusMessages == nextPaddingIncrement)	{
					nextPaddingIncrement *= 10;
					numStatusMessages = 0;
					
					list.style.paddingLeft = ((nextPaddingIncrement + "").length * 15) + "px"; // For every digit, add on a certain amount of pixels for padding
				}
			}
		});
	})();


	//---Define Singleton---//
	Heidi.container.Viewport = Ext.create("Ext.container.Viewport", {
		layout:"fit",
		items:[
			{
				xtype:"panel",
				title:"HeidiJS (Version: " + Heidi.version + ")",
				iconCls:"icon-viewport-heidi-js",
				layout:"border",
				border:false,
				items:[
					{
						xtype:"toolbar",
						region:"north",
						border:false,
						items:[
							{
								text:"Test"
							}
						]
					},
					{
						xtype:"container",
						region:"center",
						layout:{
							type:"border"
						},
						border:false,
						defaults:{
							split:true
						},
						items:[
							connectionsTreePanel,
							connectionTabPanel
						]
					},
					statusPanel
				],
				dockedItems:[
					{
						xtype:"toolbar",
						dock:"top",
						items:[
							{
								text:"File"
							}
						]
					}
				]
			}
		],
		
		addConnection:function(inConnectionId)	{
			var connectionInformation = Heidi.window.ConnectionManager.getConnectionInformation(inConnectionId),
				connectionId = connectionInformation.connectionId,
				proxyInstance = Heidi.window.ConnectionManager.getProxyInstanceFromConnectionId(connectionId),
				connectionNode = Ext.create(CONNECTIONS_TREE_PANEL_MODEL_NAME, {
					id:connectionId,
					connectionId:connectionId,
					type:"connection",
					text:connectionInformation.name,
					iconCls:connectionInformation.proxyConnectionTreeNodeIconCls,
					proxyInstance:proxyInstance
				}),
				allCompatibleTabNames = Heidi.window.ConnectionManager.getAllCompatibleTabsNamesFromConnectionId(connectionId);
			
			
			//---Add Missing Compatible Tabs---//
			Ext.Array.each(allCompatibleTabNames, function(inCompatibleTabName)	{
				if(connectionTabPanel.items.findBy(function(inTab) { return inTab.tabName == inCompatibleTabName; }))	{ // This tab has already been added by another connection
					return true;
				}
				
				var compatibleTab = Ext.create("Heidi.tab." + inCompatibleTabName, {
					tabName:inCompatibleTabName,
					hidden:true,
					
					isCompatible:function(inTabNames)	{
						return (inTabNames.indexOf(inCompatibleTabName) != -1);
					}
				});
				connectionTabPanel.add(compatibleTab);
			});
			
			
			//---Only Show Compatible Tabs---//
			connectionsTreePanel.store.tree.root.appendChild(connectionNode);
			connectionNode.expand();
			connectionTabPanel.syncTabsWithTreeNode(connectionNode);
		},
		
		appendStatusMessage:function(inMessage, inType)	{
			statusPanel.appendStatusMessage(inMessage, inType);
		}
	});
});