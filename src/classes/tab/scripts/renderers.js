function tabBackgroundPercentageRenderer(inValue, inPercentage, inSuffix)	{
	return "<div class='tab-host-command-statistics-percentage' style='width: " + (inPercentage) + "%'>" + inValue + (inSuffix || "") + "</div>";
}