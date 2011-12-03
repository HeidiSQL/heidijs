Ext.define("Heidi.tab.Query", {
	extend:"Ext.panel.Panel",
	
	title:"Query",
	iconCls:"icon-tab-query",
	
	syncWithTreeNode:function(inTreeNode)	{
		this.proxyInstance = inTreeNode.get("proxyInstance");
	}
});