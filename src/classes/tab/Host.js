Ext.define("Heidi.tab.Host", {
	extend:"Ext.tab.Panel",
	
	title:"Host",
	iconCls:"icon-tab-host",
	
	initComponent:function()	{
		//---Call Parent---//
		this.callParent.apply(this, arguments);
	
	
		//---Constants---//
		var HOST_DATABASES_GRID_MODEL_NAME = "HostDatabasesGridModelName",
			HOST_VARIABLES_GRID_MODEL_NAME = "HostVariablesGridModelName";
		
	
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