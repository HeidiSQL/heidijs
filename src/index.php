<?

//---Start Session---//
session_start();


//---Check Automake---//
if(!array_key_exists("automake", $_SESSION))	{
	$_SESSION["automake"] = true;
}

if($_SESSION["automake"])	{
	$_SESSION["automake"] = false;
	echo "<script type='text/javascript'>document.location.href = '../src/makefile.php?automake=1';</script>";
	return false;
}

$_SESSION["automake"] = true;


//---Include index.html---//
?>