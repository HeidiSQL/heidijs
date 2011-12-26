Ext.define("Heidi.tab.Table", {
	extend:"Ext.panel.Panel",
	
	title:"Table",
	iconCls:"icon-tab-table",
	layout:"border",
	
	initComponent:function()	{
		//---Call Parent---//
		this.callParent(arguments);
		
		
		//---Constants---//;
		var TABLE_GRID_MODEL_NAME = "TableGridModelName",
			TABLE_INDEXES_GRID_MODEL_NAME = "TableIndexesGridModelName",
			TABLE_FOREIGN_KEYS_GRID_MODEL_NAME = "TableForeignKeysGridModelName";
		
		
		//---Create Basic Form---//
		var basicForm = Ext.create("Ext.panel.Panel",	{
			title:"Basic",
			iconCls:"icon-tab-table-basic-form",
			layout:"border",
			
			defaults:{
				xtype:"form",
				defaults:{
					anchor:"100%"
				}
			},
			items:[
				{
					region:"north",
					height:20,
					items:[
						{
							xtype:"textfield",
							name:"name",
							fieldLabel:"Name"
						}
					]
				},
				{
					region:"center",
					items:[
						{
							xtype:"textarea",
							name:"comments",
							fieldLabel:"Comments"
						}
					]
				}
			]
		});
		
		
		//---Create Tab Panel---//
		this.add({
			xtype:"tabpanel",
			
			region:"north",
			resizable:true,
			collapsible:true,
			height:250,
			
			items:[
				basicForm
			]
		});
		
		
		//---Create Grid---//
		if(!Ext.ModelManager.getModel(TABLE_GRID_MODEL_NAME))	{
			Ext.define(TABLE_GRID_MODEL_NAME, {
				extend:"Ext.data.Model",
				fields:[
					"number",
					"field_name",
					"data_type",
					"length",
					"unsigned",
					"allow_null",
					"zerofill",
					"default"
				]
			});
		}
		
		this.gridPanel = this.add({
			xtype:"gridpanel",
			
			region:"center",
			store:{
				model:TABLE_GRID_MODEL_NAME
			},
			columns:[
				{
					text:"#",
					dataIndex:"number"
				},
				{
					text:"Name",
					dataIndex:"field_name"
				},
				{
					text:"Data Type",
					dataIndex:"data_type"
				},
				{
					text:"Length",
					dataIndex:"length"
				},
				{
					text:"Unsigned",
					dataIndex:"unsigned"
				},
				{
					text:"Allow Null",
					dataIndex:"allow_null"
				},
				{
					text:"Zerofill",
					dataIndex:"zerofill"
				},
				{
					text:"Default",
					dataIndex:"default"
				}
			]
		});
	},
	
	syncWithTreeNode:function(inTreeNode)	{
		var proxyInstance = inTreeNode.get("proxyInstance"),
			grid = this.gridPanel,
			database = inTreeNode.get("database"),
			table = inTreeNode.get("table");
		
		this.setTitle("Table: " + table);
		this.proxyInstance = proxyInstance;
		
		grid.store.setProxy(proxyInstance.getTableStructureProxyConfig());
		Ext.apply(grid.store.proxy.extraParams, {
			database:database,
			table:table
		});
		
		grid.store.load();
	}
});