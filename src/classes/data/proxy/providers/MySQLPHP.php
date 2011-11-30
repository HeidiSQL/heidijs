<?

//---Start Session---//
session_start();


//---Verification---//
if(!array_key_exists("flag", $_REQUEST))	{
	exit;
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
	$connection_id = $params["id"];
	
	
	//---Attempt Connection---//
	$connect_function = "mysql_connect";
	$connect_function_params = array($hostname_ip . ":" . $port, $username, $password);
	
	$connection = @call_user_func_array($connect_function, $connect_function_params);
	if($connection === false)	{
		$response = array(
			"type"=>"error",
			"message"=>"There was an error when establishing a connection. Automated error: " . mysql_error()
		);
	}
	else	{
		//---Store Connection Information---//
		if(!array_key_exists("connections", $_SESSION))	{
			$_SESSION["connections"] = array();
		}
		
		$_SESSION["connections"][$connection_id] = array(
			"connect_function"=>$connect_function,
			"connect_function_params"=>$connect_function_params
		);
	
		$response = array(
			"type"=>"success",
			"message"=>$connection_id
		);
	}
}

echo json_encode($response);