Ext.define("Heidi.tab.Host", {
	extend:"Ext.tab.Panel",
	
	title:"Host",
	iconCls:"icon-tab-host",
	
	initComponent:function()	{
		//---Call Parent---//
		this.callParent.apply(this, arguments);
	
	
		//---Constants---//
		var HOST_DATABASES_GRID_MODEL_NAME = "HostDatabasesGridModelName";
		
	
		//---Add Databases Grid---//
		if(!Ext.ModelManager.getModel(HOST_DATABASES_GRID_MODEL_NAME))	{
			Ext.define(HOST_DATABASES_GRID_MODEL_NAME, {
				extend:"Ext.data.Model",
				
				fields:[
					"databaseName",
					"size",
					"items",
					"lastUpdated",
					"numTables",
					"numViews",
					"numFunctions",
					"numTriggers",
					"numEvents",
					"defaultCollation"
				]
			});
		}
		
		this.add({
			xtype:"gridpanel",
			
			title:"Databases",
			iconCls:"icon-tab-host-databases",
			
			store:{
				proxy:{
					type:"memory",
					reader:{
						type:"json"
					}
				},
				model:HOST_DATABASES_GRID_MODEL_NAME
			},
			columns:[
				{
					text:"Database",
					dataIndex:"databaseName"
				},
				{
					text:"Size",
					dataIndex:"size"
				},
				{
					text:"Items",
					dataIndex:"items"
				},
				{
					text:"Last Updated",
					dataIndex:"lastUpdated"
				},
				{
					text:"Tables",
					dataIndex:"numTables"
				},
				{
					text:"Views",
					dataIndex:"numViews"
				},
				{
					text:"Functions",
					dataIndex:"numFunctions"
				},
				{
					text:"Processes",
					dataIndex:"numProcesses"
				},
				{
					text:"Triggers",
					dataIndex:"numTriggers"
				},
				{
					text:"Events",
					dataIndex:"numEvents"
				},
				{
					text:"Default Collation",
					dataIndex:"defaultCollation"
				}
			],
			forceFit:true,
			
			syncWithProxyInstance:function(inProxyInstance)	{
				//---Variables---//
				var me = this;
				
				
				//---Load Store---//
				me.store.removeAll();
				me.el.mask("Loading...");
				
				inProxyInstance.loadConnectionDatabasesInformation(function(inRecords)	{
					me.store.loadData(inRecords);
					me.el.unmask();
				});
			}
		});
		
		
		//---Finalize Tab Panel---//
		this.setActiveTab(0);
	},
	
	needsToSyncWithTreeNode:function(inTreeNode)	{
		return (inTreeNode.get("type") == "connection" && this.proxyInstance != inTreeNode.get("proxyInstance"));
	},
	syncWithTreeNode:function(inTreeNode)	{
		//---Variables---//
		var proxyInstance = inTreeNode.get("proxyInstance");
	
	
		//---Configure Tab---//
		this.setTitle("Host: " + inTreeNode.get("text"));
		this.proxyInstance = proxyInstance;
		
		
		//---Configure Child Tabs---//
		this.items.each(function(inChildTab, inIndex)	{
			if(inIndex == 0)	{
				inChildTab.syncWithProxyInstance(proxyInstance);
			}
			else	{
				inChildTab.addListener("activate", function()	{
					childTabSync(inChildTab);
				}, inChildTab, {single:true});
			}
		});
	}
});