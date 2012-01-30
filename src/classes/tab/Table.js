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
				TABLE_FOREIGN_KEYS_GRID_MODEL_NAME = "TableForeignKeysGridModelName",
				TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME = "TableEditorDatatypeComboModelName",
				TABLE_EDITOR_BASE_CLS = "tab-table-data-type-";
			
			
			//---Create Basic Form---//
			this.basicForm = Ext.create("Ext.form.Panel",	{
				title:"Basic",
				iconCls:"icon-tab-table-basic-form",
				cls:"tab-table-body",
				layout:"fit",
				items:[
					{
						xtype:"container",
						
						layout:"border",
						cls:"tab-table-body-border-container",
						border:false,
						
						defaults:{
							xtype:"container",
							border:false,
							layout:"fit",
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
					this.basicForm
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
			
			if(!Ext.ModelManager.getModel(TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME))	{
				Ext.define(TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME, {
					extend:"Ext.data.Model",
					fields:[
						"display",
						"selectable",
						"cls"
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
						renderer:tableEditorGenericColumnRenderer,
						editor:{
							xtype:"combo",
							store:{
								proxy:{
									type:"memory",
									reader:{
										type:"json"
									}
								},
								model:TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME,
								data:[
									{
										display:"Integer",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"TINYINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer"
									},
									{
										display:"SMALLINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer"
									},
									{
										display:"MEDIUMINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer"
									},
									{
										display:"INT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer"
									},
									{
										display:"BIGINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer"
									}
								]
							},
							valueField:"display",
							displayField:"display"
						}
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
			//---Variables---//
			var proxyInstance = inTreeNode.get("proxyInstance"),
				grid = this.gridPanel,
				formPanel = this.basicForm,
				database = inTreeNode.get("database"),
				table = inTreeNode.get("table");
				
				
			//---Sync Tab---//
			this.setTitle("Table: " + table);
			this.proxyInstance = proxyInstance;
			
			
			//---Update Table Editor Grid---//
			grid.store.setProxy(proxyInstance.getTableStructureProxyConfig());
			Ext.apply(grid.store.proxy.extraParams, {
				database:database,
				table:table
			});
			
			grid.store.load();
			
			
			//---Update Editor Tabs---//
			var form = formPanel.getForm();
			form.setValues({
				name:table
			});
			
			if(formPanel.el)	{
				formPanel.el.mask("Loading...");
			}
			
			var detailedTableStructureProxyInstance = proxyInstance.getDetailedTableStructureProxyInstance();
			detailedTableStructureProxyInstance.load({
				params:{
					database:database,
					table:table
				},
				callback:function(inData)	{
					if(formPanel.el)	{
						formPanel.el.unmask();
					}
					
					form.setValues(inData);
				}
			});
		}
	});
	
	
	//---Renderers---//
	function tableEditorGenericColumnRenderer(inValue, inMeta, inRecord, inRowIndex, inColumnIndex, inStore, inView)	{
		var tdCls = "";
	
		if(inView)	{
			var column = inView.headerCt.getComponent(inColumnIndex),
				editor = column.getEditor();
			
			if(editor && editor.store && editor.displayField && editor.valueField)	{
				var editorRecordIndex = editor.store.findBy(function(inEditorRecord) { return inEditorRecord.get(editor.valueField) == inValue; });
				
				if(editorRecordIndex != -1)	{
					var editorRecord = editor.store.getAt(editorRecordIndex),
						editorRecordCls = editorRecord.get("cls");
					
					if(editorRecordCls)	{
						tdCls += " " + editorRecordCls;
					}
				}
			}
		}
	
		if(inRecord.get("primary_key"))	{
			tdCls += " tab-table-basic-primary-key-row-cell" + (inColumnIndex == 0 ? " tab-table-basic-primary-key-number-cell" : "")
		}
		
		if(tdCls)	{
			inMeta.tdCls = (inMeta.tdCls || "") + " " + tdCls;
		}
		
		return inValue;
	}
})();