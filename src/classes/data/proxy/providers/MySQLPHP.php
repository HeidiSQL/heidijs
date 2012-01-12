<?

//---Start Session---//
session_start();


//---Verification---//
if(!array_key_exists("flag", $_REQUEST))	{
	exit;
}

if(!array_key_exists("callback", $_REQUEST))	{ // Convenience, prevents warnings
	$_REQUEST["callback"] = false;
}


//---Check Establish Connection---//
$response = NULL;

if($_REQUEST["flag"] == "establish_connection")	{
	//---Extract Params---//
	$params = json_decode(stripslashes($_REQUEST["params"]), true);
	
	$hostname_ip = $params["hostname_ip"];
	$port = $params["port"];
	$username = $params["username"];
	$password = $params["password"];
	
	
	//---Attempt Connection---//
	$connect_function = "mysql_connect";
	$connect_function_params = array($hostname_ip . ":" . $port, $username, $password);
	
	append_status_message("Trying to connect to host " . $hostname_ip . " on port " . $port . " as " . $username . " (Using password: " . ($password ? "yes" : "no") . ")", "status");
	$connection = @call_user_func_array($connect_function, $connect_function_params);
	if($connection === false)	{
		display_response(false, "There was an error when establishing a connection. Automated error: " . mysql_error());
	}
	else	{
		//---Store Connection Information---//
		if(!array_key_exists("connections", $_SESSION))	{
			$_SESSION["connections"] = array();
		}
		
		$connection_id = count($_SESSION["connections"]) + 1;
		
		$_SESSION["connections"][$connection_id] = array(
			"connect_function"=>$connect_function,
			"connect_function_params"=>$connect_function_params
		);
	
		append_status_message("Successfully connected to server. Saving connection information.", "status");
		display_response(true, $connection_id);
	}
}
elseif($_REQUEST["flag"] == "reestablish_connection")	{
	if(!array_key_exists("connections", $_SESSION))	{
		display_response(false, "No existing connections found to reestablish.");
	}
	
	if(!$_SESSION["connections"][$_REQUEST["connection_id"]])	{
		display_response(false, "Specified connection could not be found in set of connections.");
	}
	
	display_response(true, $_REQUEST["connection_id"]);
}


//---Establish Connection---//
if(!array_key_exists("connection_id", $_REQUEST))	{
	exit;
}

$connection_information = $_SESSION["connections"][$_REQUEST["connection_id"]];
$connection = @call_user_func_array("call_user_func_array", $connection_information);
if(!$connection)	{
	display_response(false, "There was an error when establishing a connection. Automated error: " . mysql_error());
}


//---Check Flag---//
$response = null;
$json_encode_response = true;

switch($_REQUEST["flag"])	{
	case "load_databases":
		$return_array = array();
	
		$records = run_query_and_get_records($connection, "SHOW DATABASES;");
		foreach($records as $record)	{
			$database_name = $record["Database"];
		
			$return_array[] = array(
				"id"=>$database_name,
				"connectionId"=>$_REQUEST["connection_id"],
				"type"=>"database",
				"text"=>$database_name,
				"database"=>$database_name,
				"iconCls"=>"icon-proxy-mysql-php-database"
			);
		}
		
		$response = $return_array;
		$json_encode_response = false;
		break;
	case "load_tables":
		$return_array = array();
		
		$records = run_query_and_get_records($connection, "SHOW TABLES FROM " . $_REQUEST["node_id"] . ";");
		foreach($records as $record)	{
			$table_name = $record["Tables_in_" . $_REQUEST["node_id"]];
			
			$return_array[] = array(
				"id"=>md5($_REQUEST["node_id"]) . "|" . $table_name,
				"connectionId"=>$_REQUEST["connection_id"],
				"type"=>"table",
				"text"=>$table_name,
				"iconCls"=>"icon-proxy-mysql-php-table",
				"leaf"=>true,
				"database"=>$_REQUEST["node_id"],
				"table"=>$table_name
			);
		}
	
		$response = $return_array;
		$json_encode_response = false;
		break;
	case "load_databases_information":
		$return_array = array();
		
		$records = run_query_and_get_records($connection, "SELECT * FROM information_schema.SCHEMATA;");
		foreach($records as $record)	{
			$return_array[] = array(
				"databaseName"=>$record["SCHEMA_NAME"],
				"defaultCollation"=>$record["DEFAULT_COLLATION_NAME"]
			);
		}
		
		$response = $return_array;
		break;
	case "load_connection_variables";
		$return_array = array();
	
		list($records, $total) = run_query_and_get_records($connection, "SHOW VARIABLES;", true);
		foreach($records as $record)	{
			$return_array[] = array(
				"variable"=>$record["Variable_name"],
				"value"=>$record["Value"]
			);
		}
		
		$response = array("rows"=>$return_array, "total"=>$total);
		break;
	case "load_connection_status_grid":
		$return_array = array();
	
		list($records, $total) = run_query_and_get_records($connection, "SHOW STATUS;", true);
		foreach($records as $record)	{
			$return_array[] = array(
				"variable"=>$record["Variable_name"],
				"value"=>$record["Value"],
				"avg_per_hour"=>0,
				"avg_per_second"=>0
			);
		}
		
		$response = array("rows"=>$return_array, "total"=>$total);
		break;
	case "load_connection_process_list_information":
		$return_array = array();
		
		$records = run_query_and_get_records($connection, "SELECT * FROM information_schema.PROCESSLIST;");
		foreach($records as $record)	{
			$return_array[] = array(
				"id"=>$record["ID"],
				"user"=>$record["USER"],
				"host"=>$record["HOST"],
				"db"=>$record["DB"],
				"command"=>$record["COMMAND"],
				"time"=>$record["TIME"],
				"state"=>$record["STATE"],
				"info"=>$record["INFO"]
			);
		}
		
		$response = $return_array;
		break;
	case "load_connection_command_statistics_information":
		//---Generate Array---//
		$return_array = array();
		$total = 0;
		
		$records = run_query_and_get_records($connection, "SHOW GLOBAL STATUS LIKE 'Com\_%';");
		foreach($records as $record)	{
			$total += $record["Value"];
			
			$return_array[] = array(
				"command_type"=>substr(str_replace("_", " ", $record["Variable_name"]), 4),
				"total_count"=>$record["Value"],
				"avg_per_hour"=>0,
				"avg_per_second"=>0,
				"percentage"=>0
			);
		}
		
		array_unshift($return_array, array(
			"command_type"=>"All Commands",
			"total_count"=>$total,
			"avg_per_hour"=>0,
			"avg_per_second"=>0,
			"percentage"=>100
		));
		
		
		//---Calculate Percentage---//
		if($total)	{
			foreach($return_array as $index=>$record)	{
				$return_array[$index]["percentage"] = ($record["total_count"] / $total) * 100;
			}
		}
		
		
		//---Do Sorting---//
		if(array_key_exists("sorters", $_REQUEST))	{
			$_REQUEST["sorters"] = json_decode($_REQUEST["sorters"], true);
			
			if(!function_exists("mysql_php_proxy_load_command_statistics_sort"))	{
				function mysql_php_proxy_load_command_statistics_sort($in_a, $in_b)	{
					foreach($_REQUEST["sorters"] as $sort)	{
						$a = $in_a[$sort["field"]] * 1;
						$b = $in_b[$sort["field"]] * 1;
						$comp = $a - $b;
						
						if($comp != 0)	{
							return $comp * ($sort["direction"] == "ASC" ? 1 : -1);
						}
					}
					
					return strcmp($in_a["command_type"], $in_b["command_type"]);
				}
			}
			
			usort($return_array, "mysql_php_proxy_load_command_statistics_sort");
		}
		
		
		//---Do Paging---//
		$num_records = count($return_array);
		$return_array = array_slice($return_array, $_REQUEST["start"], $_REQUEST["limit"]);
		
		
		//---Set Response---//
		$response = array("rows"=>$return_array, "total"=>$num_records);
		break;
	case "load_database_information":
		$return_array = array();
		$max_size = -1 * PHP_INT_MAX;
	
		list($records, $total) = run_query_and_get_records($connection, "SHOW TABLE STATUS FROM " . $_REQUEST["database"] . ";", true);
		foreach($records as $record)	{
			$size = $record["Data_length"];
			if($size > $max_size)	{
				$max_size = $size;
			}
			
			$unit = "B";
			if($size > 1024)	{
				$size /= 1024;
				if($size < 1024)	{
					$unit = "KB";
				}
				else	{
					$size /= 1024;
					if($size < 1024)	{
						$unit = "MB";
					}
					else	{
						$size /= 1024;
						$unit = "GB";
					}
				}
			}
		
			$return_array[] = array(
				"table_name"=>$record["Name"],
				"num_rows"=>$record["Rows"],
				"size"=>($size ? round($size, 1) . " " . $unit : ""),
				"size_percent"=>$record["Data_length"],
				"create_date"=>$record["Create_time"],
				"modify_date"=>$record["Update_time"],
				"engine"=>$record["Engine"],
				"comment"=>$record["Comment"],
				"type"=>($record["Comment"] != "VIEW" ? "Table" : "View")
			);
		}
		
		foreach($return_array as $index=>$record)	{
			$return_array[$index]["size_percent"] = ($max_size ? ($record["size_percent"] / $max_size) * 100 : 0);
		}
		
		
		$response = array("rows"=>$return_array, "total"=>$total);
		break;
	case "load_table_structure":
		$return_array = array();
		
		$records = run_query_and_get_records($connection, "DESCRIBE " . $_REQUEST["database"] . "." . $_REQUEST["table"] . ";");
		foreach($records as $record)	{
			list($data_type, $length_and_extras) = explode("(", $record["Type"]);
			list($length, $extras) = explode(")", $length_and_extras);
			list($unsigned, $zerofill) = explode(" ", $extras);
		
			$return_array[] = array(
				"primary_key"=>($record["Key"] == "PRI"),
				"field_name"=>$record["Field"],
				"data_type"=>$data_type,
				"length"=>$length,
				"unsigned"=>($unsigned == "unsigned"),
				"allow_null"=>($record["Null"] != "NO"),
				"zerofill"=>($zerofill == "zerofill"),
				"default"=>$record["Default"]
			);
		}
		
		$response = $return_array;
		break;
	default:
		display_response(false, "Unknown action (" . $_REQUEST["flag"] . ") to perform. Please contact your system administrator.");
		break;
}

display_response(true, ($json_encode_response ? json_encode($response) : $response));


//---Functions---//
function display_response($in_success, $in_message)	{
	if(!$in_success)	{
		append_status_message("An error occurred: " . $in_message, "error");
	}

	if($_REQUEST["callback"])	{
		echo "<script type='text/javascript'>parent." . $_REQUEST["callback"] . "(";
	}

	echo json_encode(array("type"=>($in_success ? "success" : "error"), "message"=>$in_message));
	
	if($_REQUEST["callback"])	{
		echo ")</script>";
	}
	exit;
}

function run_query_and_get_records(&$in_connection, $in_query, $in_paging=false)	{
	//---Update Status---//
	append_status_message($in_query, "query");
	
	
	//---Variables---//
	$start = (array_key_exists("start", $_REQUEST) ? $_REQUEST["start"] : 0);
	$limit = (array_key_exists("limit", $_REQUEST) ? $_REQUEST["limit"] : 0);
	
	
	//---Run Query---//
	$results = mysql_query($in_query, $in_connection);
	if($results === false)	{
		display_response(false, "Unable to process query at this time. Automated error: " . mysql_error());
	}
	
	
	//---Data Seek---//
	if($in_paging && $start)	{
		mysql_data_seek($results, $start);
	}


	//---Generate Return Array---//
	$return_array = array();
	$count = 0;
	
	while($record = mysql_fetch_assoc($results))	{
		$return_array[] = $record;
		
		$count++;
		if($in_paging && $count == $limit)	{
			break;
		}
	}
	
	return (!$in_paging ? $return_array : array($return_array, mysql_num_rows($results)));
}

function append_status_message($in_message, $in_type="query")	{
	if(!$_REQUEST["callback"])	{
		return false;
	}
	
	echo "<script type='text/javascript'>parent.Heidi.container.Viewport.appendStatusMessage(" . json_encode($in_message) . ", '" . $in_type . "')</script>";
}