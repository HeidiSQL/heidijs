<?

//---Configuration---//
$namespace_prefix = "Heidi";
$src_folder = "src/";
$src_classes_folder = $src_folder . "classes/";
$scripts_folder = "scripts/";
$css_folder = "css/";
$images_folder = "images/";
$js_file_name = $scripts_folder . "heidi.js";
$css_file_name = $css_folder . "heidi.css";


//---Get Files---//
function get_src_files_from_directory($in_directory, &$in_src_files)	{
	//---Get Files---//
	$files = scandir($in_directory);
	$files = array_flip($files);
	unset($files["."], $files[".."]);
	$files = array_keys($files);
	
	
	//---Process Files---//
	foreach($files as $file)	{
		$file_path = $in_directory . $file;
	
		if(is_dir($file_path))	{
			get_src_files_from_directory($file_path . "/", $in_src_files);
			continue;
		}
		
		if(substr_count(strtolower($file), ".js") == 1)	{
			$in_src_files["js"][] = $file_path;
		}
		elseif(substr_count(strtolower($file), ".css") == 1)	{
			$in_src_files["css"][] = $file_path;
		}
	}
}

$src_files = array(
	"js"=>array(),
	"css"=>array(),
	"images"=>array()
);

get_src_files_from_directory($src_classes_folder, $src_files);
$src_files["js"][] = $src_folder . "bootstrap.js";


//---Check Version Number---//
$version_number = array(
	"major"=>0,
	"minor"=>0,
	"revision"=>0
);

if(file_exists($js_file_name))	{
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

	$explode = explode("Version: ", $first_line);
	if(count($explode) == 2)	{
		list($version_number["major"], $version_number["minor"], $version_number["revision"]) = explode(".", substr(trim($explode[1]), 0, -1));
	}
}

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

$version_number = implode(".", $version_number);


//---File Creator Function---//
function create_combined_file($in_base_folder, $in_file_name, $in_version_number, $in_src_folder, $in_files, $in_write_namespace=false, $in_namespace_prefix="")	{
	//---Create Scripts Folder---//
	if(!is_dir($in_base_folder))	{
		$made_folder = mkdir($in_base_folder);
		if($made_folder === false)	{
			echo "Error: couldn't create folder " . $made_folder . ".";
			exit;
		}
	}


	//---Check File Open---//
	$handle = @fopen($in_file_name, "w");
	if(!$handle)	{
		echo "Error: unable to open " . $in_file_name . " for writing.";
		exit;
	}


	//---Write Header Information---//
	$header = "/*\tHeidiJS (Version: " . $in_version_number . ")\n\tGenerated: " . date("n/j/Y h:i:s A e") . "\n*/\n\n";
	$wrote_header = fwrite($handle, $header);
	if($wrote_header === false)	{
		echo "Error: unable to write header to " . $in_file_name . ".";
		exit;
	}


	//---Write $in_file_name---//
	$delimiter = "";
	$namespaces_written = array();
	$src_folder_num_slashes = substr_count($in_src_folder, "/");
	foreach($in_files as $file)	{
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
		if($in_write_namespace)	{
			$explode = explode("/", $file);
			$explode = array_slice($explode, $src_folder_num_slashes, 1);
			
			if($explode)	{
				$namespace = $in_namespace_prefix . "." . implode(".", $explode);
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
}


//---Create JS File---//
create_combined_file($scripts_folder, $js_file_name, $version_number, $src_classes_folder, $src_files["js"], true, $namespace_prefix);


//---Create CSS File---//
create_combined_file($css_folder, $css_file_name, $version_number, $src_classes_folder, $src_files["css"]);
