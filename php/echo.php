<!DOCTYPE HTML>
<html lang="en"><!-- InstanceBegin template="/Templates/StandardContent.dwt" codeOutsideHTMLIsLocked="false" -->
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<!-- InstanceBeginEditable name="doctitle" -->
<title>PHP Echo Results</title>
<!-- InstanceEndEditable -->
<link href="../css/oneColFixCtr.css" rel="stylesheet" type="text/css">
<link href="../js/prettify/prettify.css" rel="stylesheet" type="text/css">
<!-- InstanceBeginEditable name="head" -->
<style type="text/css">
</style>
<!-- InstanceEndEditable -->
</head>

<body>
<a href="../index.html" style="float:left"><img src="../img/home-button.svg" border="0"></a><!-- InstanceBeginEditable name="content" -->
<div class="title">PHP Echo Results</div>
<pre>
<?php
    /* These lines format the output as HTML comments and call dump_array repeatedly */
    echo "\n BEGIN VARIABLE DUMP \n\n";
    echo "\n\n BEGIN GET VARS \n\n";echo " ".dump_array($_GET)." \n";
    echo "\n\n BEGIN POST VARS \n\n";echo " ".dump_array($_POST)." \n";
    echo "\n\n BEGIN SESSION VARS \n\n";echo " ".dump_array($_SESSION)." \n";
    echo "\n\n BEGIN COOKIE VARS \n\n";echo " ".dump_array($_COOKIE)." \n";
    echo "\n\n END VARIABLE DUMP \n\n";
    function dump_array($array) {
        if(is_array($array)) {
            $size = count($array);
            $string = "";
            if ($size) {
                $count = 0;
                $string .= "{ ";
                //loop thru key:value pairs
                foreach($array as $var => $value) {
                    $string .= $var." = ".$value;
                    if($count++ < ($size-1)) {
                        $string .= ", ";
                    }
                }
                $string .= " }";
            }
            return $string;
        } else {
            return $array;
        }
    }
?>
</pre>
<h2>Back to <a href="echoTest.html">test page</a></h2>
<!-- InstanceEndEditable -->
<footer>
		<hr>
		<p style="font-size:1rem !important; text-align:left;margin-bottom:1em; float:left;"><a href="https://craig-creeger.github.io/">Table of Contents</a>
		</p>
		<p style="text-align:right; font-size:smaller;">Last updated on 
			<!-- #BeginDate format:Am1 -->October 28, 2015<!-- #EndDate --></p>
		<p class="tagLine" style="clear:left;">Making Every Pixel Count</p>
		<p><span id="copyrightDate">2015</span> &mdash; All rights reserved. <a href="http://pixelpro.biz/" title="Pixel Pro Web Design">Pixel Pro, Inc.</a></p>
</footer>
<script type="text/javascript" src="../js/jquery.js"></script>
<script type="text/javascript" src="../js/prettify/prettify.js"></script>
<!-- InstanceBeginEditable name="footerScripts" -->

<!-- InstanceEndEditable -->
<script type="text/javascript">
$(function() { //shortcut for $(document).ready();
	prettyPrint();
	
	//Update the Copyright Date in the footer to be the current year.
	var crDate = document.getElementById('copyrightDate');
	var today = new Date();
	crDate.innerHTML = today.getFullYear();
});
</script>
</body>
<!-- InstanceEnd --></html>
