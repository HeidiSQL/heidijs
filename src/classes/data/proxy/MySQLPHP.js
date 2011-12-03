(function()	{
	//---Private Variables---//
	var iframeNumber = 0;
	
	
	//---Private Functions---//
	function issueRequest(inOptions)	{
		//---Variables---//
		var body = Ext.getBody(),
			url = inOptions.url,
			params = inOptions.params,
			callback = inOptions.callback;
			
	
		//---Create Frame---//
		var iframeName = "mysqlphpiframe" + iframeNumber;
		iframeNumber++;
		
		try	{
			var iframe = document.createElement("<iframe name='" + iframeName + "'>"); // Do this because IE is stupid when it comes to names
		}
		catch(e)	{
			var iframe = document.createElement("iframe");
			iframe.setAttribute("name", iframeName);
		}
		
		body.dom.appendChild(iframe);
		
		
		//---Create Form---//
		var form = document.createElement("form"),
			callbackName = iframeName + "Callback";
		
		form.setAttribute("method", "POST");
		form.setAttribute("action", url + (url.indexOf("?") == -1 ? "?" : "&") + "callback=" + callbackName);
		form.setAttribute("target", iframeName);
		
		Ext.Object.each(params, function(inParamName, inParamValue)	{
			try	{
				var paramElement = document.createElement("<input name='" + inParamName + "'>"); // Another IE stupid case
			}
			catch(e)	{
				var paramElement = document.createElement("input");
				paramElement.setAttribute("name", inParamName);
			}
			
			paramElement.setAttribute("type", "hidden");
			paramElement.setAttribute("value", inParamValue);
			
			form.appendChild(paramElement);
		});
		
		body.dom.appendChild(form);
		
		
		//---Create Callback---//
		window[callbackName] = function(inResponse)	{
			//---Process Response---//
			if(inResponse.type == "error")	{
				return Ext.MessageBox.alert("Error", inResponse.message, function()	{
					if(callback)	{
						callback(false);
					}
				});
			}
			
			if(callback)	{
				callback(inResponse.message);
			}
			
			
			//---Cleanup---//
			body.dom.removeChild(iframe);
			body.dom.removeChild(form);
			window[callbackName] = null;
		};
		
		
		//---Issue Request---//
		form.submit();
	}
	

	//---Class Definition---//
	Ext.define("Heidi.data.proxy.MySQLPHP", {
		extend:"Ext.data.proxy.Ajax",
		alias:"proxy.mysqlphp",
		
		connectionTreeNodeIconCls:"icon-proxy-mysql-php-connection",
		
		url:"providers/data/proxy/MySQLPHP.php",
		establishConnection:function(inSessionRecord, inPassword, inCallback)	{
			this.issueRequest({
				url:this.url,
				params:{
					flag:"establish_connection",
					params:Ext.encode(Ext.apply(Ext.apply({}, inSessionRecord.data), {password:inPassword}))
				},
				callback:inCallback
			});
		},
		bindToConnection:function(inConnectionId)	{
			this.extraParams = Ext.apply(this.extraParams || {}, {
				connection_id:inConnectionId
			});
		},
		
		loadConnectionChildren:function(inNode, inCallback)	{
			//---Determine Flag---//
			var parentId = inNode.get("parentId"),
				flag = null;
				
			if(parentId == "root")	{ // At the host level, need to load the children
				flag = "load_databases";
			}
			else	{
				switch(inNode.get("type"))	{
					case "database":
						flag = "load_tables";
						break;
				}
			}
			
			if(flag === null)	{
				return false;
			}
			
			
			//---Make Request---//
			this.issueRequest({
				url:this.url,
				params:{
					flag:flag,
					node_id:inNode.get("id")
				},
				callback:function(inResponse)	{
					if(!inResponse)	{
						return false;
					}
					
					inCallback(inResponse);
				}
			});
			
			return true;
		},
		getCompatibleTabNamesFromNodeType:function(inNodeType)	{
			//---Variables---//
			var nodeTypeXCompatibleTabs = {
					connection:[
						"Host"
					],
					database:[
						"Database"
					],
					table:[
						"Table"
					]
				},
				compatibleTabs = [];
			
			
			//---Determine Compatible Tabs---//
			if(inNodeType == "ALL")	{
				Ext.Object.each(nodeTypeXCompatibleTabs, function(inNodeType, inCompatibleTabs)	{
					compatibleTabs.push.apply(compatibleTabs, inCompatibleTabs);
				});
			}
			else	{
				compatibleTabs.push.apply(compatibleTabs, nodeTypeXCompatibleTabs.connection);
				
				if(inNodeType != "connection")	{
					compatibleTabs.push.apply(compatibleTabs, nodeTypeXCompatibleTabs.database);
					
					if(inNodeType != "database")	{
						compatibleTabs.push.apply(compatibleTabs, nodeTypeXCompatibleTabs[inNodeType]);
					}
				}
			}
			
			compatibleTabs.push("Query");
			
			return compatibleTabs;
		},
		
		
		//---Class Specific Functions---//
		loadConnectionDatabasesInformation:function(inCallback)	{
			this.issueRequest({
				url:this.url,
				params:{
					flag:"load_databases_information"
				},
				callback:function(inResponse)	{
					if(!inResponse)	{
						return false;
					}
					
					inCallback(inResponse);
				}
			});
		},
		
		
		//---Private Functions---//
		issueRequest:function(inOptions)	{
			var options = Ext.apply({}, inOptions);
			options.params = Ext.apply(Ext.apply({}, this.extraParams), options.params);
			
			issueRequest(options);
		}
	});
})();

Heidi.ProxyManager.register("MySQL (PHP)", Heidi.data.proxy.MySQLPHP);