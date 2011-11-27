<?

//---Configuration---//
$js_file_name = "heidi.js";
$css_file_name = "heidi.css";
$namespace_prefix = "Heidi";
$src_folder = "src/";
$classes_folder = $src_folder . "classes/";


//---Get JS Files---//
function get_js_css_files_from_directory($in_directory, &$in_js_files, &$in_css_files)	{
	//---Get Files---//
	$files = scandir($in_directory);
	$files = array_flip($files);
	unset($files["."], $files[".."]);
	$files = array_keys($files);
	
	
	//---Process Files---//
	foreach($files as $file)	{
		$file_path = $in_directory . $file;
	
		if(is_dir($file_path))	{
			get_js_css_files_from_directory($file_path . "/", $in_js_files, $in_css_files);
			continue;
		}
		
		if(substr_count(strtolower($file), ".js") == 1)	{
			$in_js_files[] = $file_path;
		}
		elseif(substr_count(strtolower($file), ".css") == 1)	{
			$in_css_files[] = $file_path;
		}
	}
}

$js_files = $css_files = array();
get_js_css_files_from_directory($classes_folder, $js_files, $css_files);
$js_files[] = $src_folder . "bootstrap.js";


//---Check Version Number---//
$handle = @fopen($js_file_name, "r");
if(!$handle)	{
	echo "Error: Unable to open " . $js_file_name . " for reading.";
	exit;
}

$first_line = @fgets($handle);
if($first_line === false)	{
	echo "Error: unable to read first line of " . $js_file_name . ".";
	exit;
}

$version_number = array(
	"major"=>0,
	"minor"=>0,
	"revision"=>0
);

$explode = explode("Version: ", $first_line);
if(count($explode) == 2)	{
	list($version_number["major"], $version_number["minor"], $version_number["revision"]) = explode(".", substr(trim($explode[1]), 0, -1));
	
	if($_REQUEST["major"])	{ // Mark this as a major version
		$version_number["major"]++;
		$version_number["minor"] = $version_number["revision"] = 0;
	}
	elseif($_REQUEST["minor"])	{ // Mark this as a minor version
		$version_number["minor"]++;
		$version_number["revision"] = 0;
	}
	else	{ // This is a revision version, increment it.
		$version_number["revision"]++;
	}
}

$version_number = implode(".", $version_number);


//---Check File Open---//
$handle = @fopen($js_file_name, "w");
if(!$handle)	{
	echo "Error: unable to open " . $js_file_name . " for writing.";
	exit;
}


//---Write Header Information---//
$header = "/*\tHeidiJS (Version: " . $version_number . ")\n\tGenerated: " . date("n/j/Y h:i:s A e") . "\n*/\n\n";
$wrote_header = fwrite($handle, $header);
if($wrote_header === false)	{
	echo "Error: unable to write header to " . $js_file_name . ".";
	exit;
}


//---Write $js_file_name---//
$delimiter = "";
$namespaces_written = array();
$js_classes_num_slashes = substr_count($classes_folder, "/");
foreach($js_files as $file)	{
	//---Get Contents---//
	$file_contents = @file_get_contents($file);
	if($file_contents === false)	{
		echo "Error: unable to read contents of " . $file . ".";
		exit;
	}
	
	
	//---Write File---//
	$wrote_contents = fwrite($handle, $delimiter . "//=====" . $file . "=====//\n");
	if($wrote_contents === false)	{
		echo "Error: unable to write file header for " . $file . ".";
		exit;
	}
	
	
	//---Get Namespace---//
	$explode = explode("/", $file);
	$explode = array_slice($explode, $js_classes_num_slashes, 1);
	
	if($explode)	{
		$namespace = $namespace_prefix . "." . implode(".", $explode);
		if(!$namespaces_written[$namespace])	{
			$wrote_contents = fwrite($handle, "Ext.namespace(\"" . $namespace . "\");\n");
			if($wrote_contents === false)	{
				echo "Error: unable to write namespace " . $namespace . ".";
				exit;
			}
			
			$namespaces_written[$namespace] = true;
			$delimiter = "\n\n";
		}
	}
	
	
	//---Write File---//
	$wrote_contents = fwrite($handle, str_replace("\r", "", $file_contents));
	if($wrote_contents === false)	{
		echo "Error: unable to write contents of " . $file . ".";
		exit;
	}
	
	$delimiter = "\n\n";
}

fclose($handle);
