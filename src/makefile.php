<?

//---Configuration---//
$do_build = (array_key_exists("build", $_REQUEST) && $_REQUEST["build"]);
$build_folder = "../build/"; 
$link_folder = (!$do_build ? "../link/" : $build_folder);
$namespace_prefix = "Heidi";
$src_folder = "./";
$src_classes_folder = $src_folder . "classes/";
$src_icons_folder = $src_folder . "icons/";
$scripts_folder = $link_folder . "scripts/";
$css_folder = $link_folder . "css/";
$images_folder = $link_folder . "images/";
$js_file_name = $scripts_folder . "heidi.js";
$css_file_name = $css_folder . "heidi.css";
$src_index_file = $src_folder . "index.html";
$src_automake_index_file = $src_folder . "index.php";
$automake = (array_key_exists("automake", $_REQUEST) ? $_REQUEST["automake"] : false);
$link_index_file = $link_folder . "index." . ($automake ? "php" : "html");
$version_file = $src_folder . "version.txt";
$src_overrides_file = $src_folder . "overrides.css";
$link_providers_folder = $link_folder . "providers/";
$build_file_folder = "../";
$readme_file_name = "readme.txt";
$readme_file_path = $src_folder . $readme_file_name;


//---Remove Link Folder---//
function rrmdir($dir) { // http://www.php.net/manual/en/function.rmdir.php#98622
	if (is_dir($dir)) { 
		$objects = scandir($dir); 
		foreach ($objects as $object) { 
			if ($object != "." && $object != "..") { 
				if (filetype($dir."/".$object) == "dir") {
					rrmdir($dir."/".$object);
				}
				else	{
					unlink($dir."/".$object); 
				}
			}
			reset($objects); 
			@rmdir($dir); 
		} 
	}
}

rrmdir($link_folder);

if(is_dir($build_folder))	{ // Doesn't seem to be deleted by the rrmdir
	rmdir($build_folder);
}

$made_link_folder = mkdir($link_folder);
if($made_link_folder === false)	{
	echo "Error: unable to make link folder at " . $link_folder . ".";
	exit;
}


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
		
		$file_lower = strtolower($file);
		$file_path_lower = strtolower($file_path);
		
		if(substr_count($file_lower, ".js") == 1)	{
			$in_src_files["js"][] = $file_path;
		}
		elseif(substr_count($file_lower, ".css") == 1)	{
			$in_src_files["css"][] = $file_path;
		}
		elseif(substr_count($file_lower, ".png") == 1 || substr_count($file_lower, ".gif") == 1)	{
			$in_src_files["images"][] = $file_path;
		}
		elseif(substr_count($file_lower, ".php") == 1 && substr_count($file_path_lower, "/providers/") == 1)	{
			$in_src_files["providers"][] = $file_path;
		}
	}
}

$src_files = array(
	"js"=>array(),
	"css"=>array(),
	"images"=>array(),
	"providers"=>array()
);

get_src_files_from_directory($src_classes_folder, $src_files);
$src_files["js"][] = $src_folder . "bootstrap.js";
get_src_files_from_directory($src_icons_folder, $src_files);
$src_files["css"][] = $src_overrides_file;


//---Check Version Number---//
$version_number = array(
	"major"=>0,
	"minor"=>0,
	"revision"=>0
);

if(file_exists($version_file))	{
	$handle = @fopen($version_file, "r");
	if(!$handle)	{
		echo "Error: Unable to open " . $version_file . " for reading.";
		exit;
	}

	$first_line = @fgets($handle);
	if($first_line === false)	{
		echo "Error: unable to read first line of " . $version_file . ".";
		exit;
	}

	$explode = explode(".", $first_line);
	if(count($explode) == 3)	{
		list($version_number["major"], $version_number["minor"], $version_number["revision"]) = $explode;
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
elseif(!$do_build)	{ // This is a revision version, increment it. Don't do this auto increment if we're just building
	$version_number["revision"]++;
}

$version_number = implode(".", $version_number);


//---Write Version---//
$handle = fopen($version_file, "w");
if($handle === false)	{
	echo "Error: unable to open " . $version_file . " for writing.";
	exit;
}

$wrote_version = fwrite($handle, $version_number);
if($wrote_version === false)	{
	echo "Error: unable to write version number.";
	exit;
}

fclose($handle);


//---Create Images Folder---//
if(!is_dir($images_folder))	{
	$made_images_folder = mkdir($images_folder);
	if($made_images_folder === false)	{
		echo "Error: couldn't create " . $images_folder . " folder.";
		exit;
	}
}


//---Populate Images Folder---//
foreach($src_files["images"] as $image_file)	{
	$explode = explode("/", $image_file);
	$destination_file = $images_folder . array_pop($explode);
	
	$copied_image = copy($image_file, $destination_file);
	if($copied_image === false)	{
		echo "Error: unable to copy image " . $image_file . ".";
		exit;
	}
}


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
		$wrote_contents = fwrite($handle, $delimiter . "/*=====" . $file . "=====*/\n");
		if($wrote_contents === false)	{
			echo "Error: unable to write file header for " . $file . ".";
			exit;
		}
		
		
		//---Get Namespace---//
		if($in_write_namespace)	{
			$explode = explode("/", $file);
			$explode = array_slice($explode, $src_folder_num_slashes, 1);
			
			if($explode)	{
				$explode_file_name = end($explode);
				if($explode_file_name != "version.js")	{				
					$namespace = $in_namespace_prefix . (!substr_count($explode_file_name, ".js") ? "." . implode(".", $explode) : "");
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
				else	{
					$file_contents = str_replace("%%VERSION_NUMBER%%", $in_version_number, $file_contents);
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


//---Copy Providers---//
if(!is_dir($link_providers_folder))	{
	$made_providers_folder = mkdir($link_providers_folder);
	if($made_providers_folder === false)	{
		echo "Error: unable to make providers folder.";
		exit;
	}
}

foreach($src_files["providers"] as $src_provider_file_path)	{
	$link_provider_file_path = str_replace(array("providers/", $src_classes_folder), array("", $link_providers_folder), $src_provider_file_path);
	$explode = explode("/", $link_provider_file_path);
	$folders_checked = array_shift($explode);
	array_pop($explode);
	foreach($explode as $folder_to_check)	{
		$folder_to_check = $folders_checked . "/" . $folder_to_check;
		if(!is_dir($folder_to_check))	{
			$made_folder = mkdir($folder_to_check);
			if($made_folder === false)	{
				echo "Error: unable to make provider folder " . $folder_to_check . ".";
				exit;
			}
		}
		$folders_checked = $folder_to_check;
	}

	$copied_provider_file = copy($src_provider_file_path, $link_provider_file_path);
	if($copied_provider_file === false)	{
		echo "Error: unable to copy provider file " . $src_provider_file_path . " to link folder.";
		exit;
	}
}


//---Copy Index File---//
$index_file_contents = ($automake ? file_get_contents($src_automake_index_file) : "") . file_get_contents($src_index_file);
$copied_index_file = file_put_contents($link_index_file, $index_file_contents);
if($copied_index_file === false)	{
	echo "Error: unable to copy index file.";
	exit;
}


//---Check Automake---//
if($automake)	{
	echo "<script type='text/javascript'>document.location.href = '" . $link_index_file . "';</script>";
	return false;
}


//---Check Build---//
if($do_build)	{
	//---Check File---//
	$build_filename = $build_file_folder . "heidijs-" . $version_number . ".zip";
	if(file_exists($build_filename))	{
		if(!unlink($build_filename))	{
			echo "Error: unable to remove existing build file.";
			exit;
		}
	}

	
	//---Create ZIP---//
	$archive = new ZipArchive();
	$can_write_zip = $archive->open($build_filename, ZIPARCHIVE::CREATE);
	if(!$can_write_zip)	{
		echo "Error: unable to create zip for building.";
		exit;
	}
	
	function add_files_to_zip(&$in_archive, $in_folder, $in_base_folder)	{
		$handle = opendir($in_folder);
		if(!$handle)	{
			echo "Error: unable to open " . $in_folder . " to create build.";
			exit;
		}
		
		while(($file_name = readdir($handle)) !== false)	{
			if($file_name == "." || $file_name == "..")	{
				continue;
			}
			
			$file_path = $in_folder . $file_name;
			$zipped_file_name = substr($file_path, strlen($in_base_folder));
			if(is_dir($file_path))	{
				$added_folder = $in_archive->addEmptyDir($zipped_file_name);
				if(!$added_folder)	{
					echo "Error: unable to add folder " . $zipped_file_name . " during build.";
					exit;
				}
				
				add_files_to_zip($in_archive, $file_path . "/", $in_base_folder);
				continue;
			}
			
			$added_file = $in_archive->addFile($file_path, $zipped_file_name);
			if(!$added_file)	{
				echo "Error: unable to add file " . $file_path . " to build.";
				exit;
			}
		}
	}
	
	add_files_to_zip($archive, $build_folder, $build_folder);
	
	
	//---Add Readme---//
	$readme_contents = file_get_contents($readme_file_path);
	if(!$readme_contents)	{
		echo "Error: can't read contents of readme " . $readme_file_path . " in build.";
		exit;
	}
	
	$added_readme = $archive->addFromString($readme_file_name, str_replace(array("%%VERSION_NUMBER%%", "%%BUILD_DATE%%"), array($version_number, date("n/j/Y g:i:s A e")), $readme_contents));
	if(!$added_readme)	{
		echo "Error: can't add readme to build.";
		exit;
	}
	
	
	//---Finalize ZIP---//
	$archive->close();
	rrmdir($build_folder);
	echo "Create build of HeidiJS " . $version_number;
}