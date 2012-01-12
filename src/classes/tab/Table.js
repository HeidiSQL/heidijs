(function()	{
	//---Class Definition---//
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
				cls:"tab-table-body",
				layout:"border",
				border:false,
				
				defaults:{
					xtype:"form",
					border:false,
					defaults:{
						anchor:"100%",
						border:false
					}
				},
				items:[
					{
						region:"north",
						height:25,
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
						layout:"fit",
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
				
				title:"Table Editor",
				region:"north",
				resizable:true,
				collapsible:true,
				height:150,
				minHeight:125,
				
				items:[
					basicForm
				]
			});
			
			
			//---Create Grid---//
			if(!Ext.ModelManager.getModel(TABLE_GRID_MODEL_NAME))	{
				Ext.define(TABLE_GRID_MODEL_NAME, {
					extend:"Ext.data.Model",
					fields:[
						"primary_key",
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
						width:4,
						cls:"tab-table-basic-number-column",
						renderer:function(inValue, inMeta, inRecord, inRowIndex, inColumnIndex)	{
							inMeta.tdCls = "tab-table-basic-number-column-cell";
							inValue = inRowIndex + 1;
							
							return tableEditorGenericColumnRenderer(inValue, inMeta, inRecord, inRowIndex, inColumnIndex);
						}
					},
					{
						text:"Name",
						dataIndex:"field_name",
						width:21,
						renderer:tableEditorGenericColumnRenderer,
						editor:{
							xtype:"textfield",
							allowBlank:false
						}
					},
					{
						text:"Data Type",
						dataIndex:"data_type",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer
					},
					{
						text:"Length",
						dataIndex:"length",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer
					},
					{
						text:"Unsigned",
						dataIndex:"unsigned",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer
					},
					{
						text:"Allow Null",
						dataIndex:"allow_null",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer
					},
					{
						text:"Zerofill",
						dataIndex:"zerofill",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer
					},
					{
						text:"Default",
						dataIndex:"default",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer
					}
				],
				forceFit:true,
				selModel:{
					selType:"cellmodel"
				},
				plugins:[
					Ext.create("Ext.grid.plugin.CellEditing", {
						clicksToEdit:1
					})
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
	
	
	//---Renderers---//
	function tableEditorGenericColumnRenderer(inValue, inMeta, inRecord, inRowIndex, inColumnIndex)	{
		if(inRecord.get("primary_key"))	{
			inMeta.tdCls = (inMeta.tdCls || "") + " tab-table-basic-primary-key-row-cell" + (inColumnIndex == 0 ? " tab-table-basic-primary-key-number-cell" : "")
		}
		
		return inValue;
	}
})();