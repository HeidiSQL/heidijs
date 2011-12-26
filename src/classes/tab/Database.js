Ext.define("Heidi.tab.Database", {
	extend:"Ext.panel.Panel",
	
	title:"Database",
	iconCls:"icon-tab-database",
	layout:"fit",
	
	initComponent:function()	{
		//---Call Parent---//
		this.callParent.apply(this, arguments);
		
		
		//---Constants---//
		var DATABASE_GRID_MODEL_NAME = "DatabaseGridModelName";
		
		
		//---Add Main Grid---//
		if(!Ext.ModelManager.getModel(DATABASE_GRID_MODEL_NAME))	{
			Ext.define(DATABASE_GRID_MODEL_NAME, {
				extend:"Ext.data.Model",
				fields:[
					"table_name",
					"num_rows",
					"size",
					"size_percent",
					"create_date",
					"update_date",
					"engine",
					"comment",
					"type"
				]
			});
		}
		
		var databaseGridStore = Ext.create("Ext.data.Store", {
			model:DATABASE_GRID_MODEL_NAME,
			pageSize:50
		});
		
		this.add({
			xtype:"gridpanel",
			
			store:databaseGridStore,
			columns:[
				{
					text:"Name",
					dataIndex:"table_name"
				},
				{
					text:"Rows",
					dataIndex:"num_rows"
				},
				{
					text:"Size",
					dataIndex:"size",
					renderer:function(inValue, inMeta, inRecord)	{
						return tabBackgroundPercentageRenderer(inValue, inRecord.get("size_percent"));
					}
				},
				{
					text:"Created",
					dataIndex:"create_date"
				},
				{
					text:"Updated",
					dataIndex:"updated"
				},
				{
					text:"Engine",
					dataIndex:"engine"
				},
				{
					text:"Comment",
					dataIndex:"comment"
				},
				{
					text:"Type",
					dataIndex:"type"
				}
			],
			forceFit:true,
			dockedItems:[
				{
					xtype:"pagingtoolbar",
					dock:"bottom",
					store:databaseGridStore,
					displayInfo:true
				}
			]
		});
	},
	
	syncWithTreeNode:function(inTreeNode)	{
		var proxyInstance = inTreeNode.get("proxyInstance"),
			grid = this.getComponent(0),
			databaseName = inTreeNode.get("database");
		
		this.setTitle("Database: " + databaseName);
		this.proxyInstance = proxyInstance;
		
		grid.store.setProxy(proxyInstance.getDatabaseInformationProxyConfig());
		grid.store.proxy.extraParams.database = databaseName;
		
		if(grid.isVisible())	{
			grid.store.load();
		}
		else	{
			this.addListener("activate", function()	{
				grid.store.load();
			}, this, {single:true});
		}
	}
});