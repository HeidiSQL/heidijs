Ext.define("Heidi.tab.Host", {
	extend:"Ext.tab.Panel",
	
	title:"Host",
	iconCls:"icon-tab-host",
	
	initComponent:function()	{
		//---Call Parent---//
		this.callParent.apply(this, arguments);
	
	
		//---Constants---//
		var HOST_DATABASES_GRID_MODEL_NAME = "HostDatabasesGridModelName",
			HOST_VARIABLES_GRID_MODEL_NAME = "HostVariablesGridModelName",
			HOST_STATUS_GRID_MODEL_NAME = "HostStatusGridModelName",
			HOST_PROCESS_LIST_GRID_MODEL_NAME = "HostProcessListGridModelName";
		
	
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
			
			proxyInstanceMethodName:"loadConnectionDatabasesInformation"
		});
		
		
		//---Add Variables Grid---//
		if(!Ext.ModelManager.getModel(HOST_VARIABLES_GRID_MODEL_NAME))	{
			Ext.define(HOST_VARIABLES_GRID_MODEL_NAME, {
				extend:"Ext.data.Model",
				
				fields:[
					"variable",
					"value"
				]
			});
		}
		
		var variablesGridStore = Ext.create("Ext.data.Store", {
			proxy:{
				type:"memory",
				reader:{
					type:"json"
				}
			},
			model:HOST_VARIABLES_GRID_MODEL_NAME,
			pageSize:50
		});
		
		this.add({
			xtype:"gridpanel",
			
			title:"Variables",
			iconCls:"icon-tab-host-variables",
			
			store:variablesGridStore,
			columns:[
				{
					text:"Variable",
					dataIndex:"variable",
					width:250
				},
				{
					text:"Value",
					dataIndex:"value",
					flex:1
				}
			],
			forceFit:true,
			dockedItems:[
				{
					xtype:"pagingtoolbar",
					dock:"bottom",
					store:variablesGridStore,
					displayInfo:true
				}
			],
			
			proxyInstanceMethodName:"loadConnectionVariablesInformation"
		});
		
		
		//---Create Status Grid---//
		if(!Ext.ModelManager.getModel(HOST_STATUS_GRID_MODEL_NAME))	{
			Ext.define(HOST_STATUS_GRID_MODEL_NAME, {
				extend:"Ext.data.Model",
				fields:[
					"variable",
					"value",
					"avg_per_hour",
					"avg_per_second"
				]
			});
		}
		
		var statusGridStore = Ext.create("Ext.data.Store", {
			proxy:{
				type:"memory",
				reader:{
					type:"json"
				}
			},
			model:HOST_STATUS_GRID_MODEL_NAME,
			pageSize:50
		});
		
		this.add({
			xtype:"gridpanel",
			
			title:"Status",
			iconCls:"icon-tab-host-status",
			
			store:statusGridStore,
			columns:[
				{
					text:"Variable",
					dataIndex:"variable",
					flex:1
				},
				{
					text:"Value",
					dataIndex:"value",
					width:75
				},
				{
					text:"Avg. Per Hour",
					dataIndex:"avg_per_hour",
					width:100
				},
				{
					text:"Avg. Per Second",
					dataIndex:"avg_per_second",
					width:125
				}
			],
			forceFit:true,
			dockedItems:[
				{
					xtype:"pagingtoolbar",
					dock:"bottom",
					store:statusGridStore,
					displayInfo:true
				}
			],
			
			proxyInstanceMethodName:"loadConnectionStatusGridInformation"
		});
		
		
		//---Create Process List Grid---//
		if(!Ext.ModelManager.getModel(HOST_PROCESS_LIST_GRID_MODEL_NAME))	{
			Ext.define(HOST_PROCESS_LIST_GRID_MODEL_NAME, {
				extend:"Ext.data.Model",
				fields:[
					"id",
					"user",
					"host",
					"db",
					"command",
					"time",
					"state",
					"info"
				]
			});
		}
		
		this.add({
			xtype:"gridpanel",
			
			title:"Process List",
			iconCls:"icon-tab-host-process-list",
			
			store:{
				proxy:{
					type:"memory",
					reader:{
						type:"json"
					}
				},
				model:HOST_PROCESS_LIST_GRID_MODEL_NAME
			},
			columns:[
				{
					text:"ID",
					dataIndex:"id",
					width:4
				},
				{
					text:"User",
					dataIndex:"user",
					width:6
				},
				{
					text:"Host",
					dataIndex:"host",
					width:12
				},
				{
					text:"DB",
					dataIndex:"db",
					width:14
				},
				{
					text:"Command",
					dataIndex:"command",
					width:8
				},
				{
					text:"Time",
					dataIndex:"time",
					width:8
				},
				{
					text:"State",
					dataIndex:"state",
					width:8
				},
				{
					text:"Info",
					dataIndex:"info",
					width:30
				}
			],
			forceFit:true,
			
			proxyInstanceMethodName:"loadConnectionProcessListInformation"
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
		
		
		//---Functions---//
		function syncTabWithProxyInstance(inChildTab)	{
			//---Check Chilld Tab Override---//
			if(inChildTab.syncWithProxyInstance)	{
				return inChildTab.syncWithProxyInstance(proxyInstance);
			}
		
		
			//---Load Store---//
			function loadChildTabStore(inRecords)	{
				inChildTab.store.loadData(inRecords.rows || inRecords);
				
				if(inRecords.total)	{
					inChildTab.store.totalCount = inRecords.total;
					inChildTab.dockedItems.findBy(function(inDockedItem) { return inDockedItem.xtype == "pagingtoolbar"; }).onLoad();
				}
				
				inChildTab.el.unmask();
			}
			
			inChildTab.store.removeAll();
			inChildTab.el.mask("Loading...");
			
			var proxyLoadMethod = Ext.bind(proxyInstance[inChildTab.proxyInstanceMethodName], proxyInstance);
			proxyLoadMethod(loadChildTabStore);
			
			inChildTab.store.proxy.read = function(inOperation, inCallback, inScope)	{ // Often called when paging is attempted
				proxyLoadMethod(function()	{
					//---Load Store---//
					loadChildTabStore.apply(this, arguments);
					
					
					//---Finish Operation---//
					inCallback.apply(inScope || this, [inOperation]);
				}, inOperation.start, inOperation.limit);
			};
		}
	
	
		//---Configure Tab---//
		this.setTitle("Host: " + inTreeNode.get("text"));
		this.proxyInstance = proxyInstance;
		
		
		//---Configure Child Tabs---//
		this.items.each(function(inChildTab, inIndex)	{
			if(inIndex == 0)	{
				syncTabWithProxyInstance(inChildTab);
			}
			else	{
				inChildTab.addListener("activate", function()	{
					syncTabWithProxyInstance(inChildTab);
				}, inChildTab, {single:true});
			}
		});
	}
});