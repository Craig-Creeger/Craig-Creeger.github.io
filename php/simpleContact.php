<?php
$statusMessage = FALSE;
$delivered = TRUE;
if (array_key_exists('submitButton', $_POST)) {
	//The email form was submitted.
	// These POST variable come from the HTML form
	$email = (array_key_exists('email',$_POST)) ? $_POST['email'] : false;
	$fullName = (array_key_exists('fullName',$_POST)) ? $_POST['fullName'] : false;
	$phone = (array_key_exists('phone',$_POST)) ? $_POST['phone'] : false;
	$comments = (array_key_exists('comments',$_POST)) ? $_POST['comments'] : false;
	
	// These are the constants that you want applied to ALL emails.	
	$toAddress = 'craig@pixelpro.biz'; //All emails will get sent to this address
	$subject = 'Website Comment Form';
	$fromAddress = '"Craig Creeger" <craig@pixelpro.biz>';
	
	// Build the email message	
	$emailMsg = "The following information was entered on the website comment form.\n\n"; // \n = newline
	$emailMsg .= "Full Name: $fullName\n\n";
	$emailMsg .= "eMail: $email\n";
	$emailMsg .= "Phone: $phone\n\n";
	$emailMsg .= "Comment: $comments\n";
		
	$headers = "From: $fromAddress\r\n";
	$headers .= "Reply-To: $fromAddress\r\n";
	//Uncomment the following line to make it actually send an email.
	//$delivered = mail($toAddress, $subject, $emailMsg, $headers);
	if ($delivered) {
		$statusMessage = "<p>Thanks for the comment. We will get back to you shortly.</p>";
	} else {
		$statusMessage = "<p>Sorry - there was a problem delivering your comments. Please give us a call.</p><p>From: ".$email."</p><p>".$comments."</p><p>Return code=$delivered </p>";
	}
}
?>
<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Simple Contact Form</title>
<style type="text/css">
html {
	font-family:Verdana, Geneva, sans-serif;
	font-size:100%;
	line-height:1.4;
	background-color:#7A0019;
}
body {
	width:80%;
	margin:1em auto 0;
	background-color:#FC3;
	padding:.5em 2em;
}
label {
	display:inline-block;
	width:8em;
}
input[type="text"] {
	width:15em;
}
</style>
</head>

<body>
<div class="title">Contact Us</div>
<?php
if($statusMessage):
	echo $statusMessage;
else: ?>
	<form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="post" name="contact">
		<h1>Contact Information</h1>
		<p> <label for="fullName">Full Name:</label> <input type="text" name="fullName" id="fullName" value="Samantha Claussen"> </p>
		<p> <label for="phone">Phone:</label> <input type="text" name="phone" id="phone" value="(651) 555-1234"> </p>
		<p> <label for="email">Email:</label> <input type="text" name="email" id="email" value="sam@pixelpro.biz"> </p>
		<p> <label for="comments" style="width:auto;">Comments or Questions</label>
			<textarea name="comments" rows="6" style="width:100%;">Boom Chicka Wow Wow</textarea></p>
		<p><input name="submitButton" type="submit" value="Send"></p>
	</form>
<?php endif; ?>
<pre>$statusMessage = FALSE;
if (array_key_exists('submitButton', $_POST)) {
	//The email form was submitted.
	// These POST variable come from the HTML form
	$email = (array_key_exists('email',$_POST)) ? $_POST['email'] : false;
	$fullName = (array_key_exists('fullName',$_POST)) ? $_POST['fullName'] : false;
	$phone = (array_key_exists('phone',$_POST)) ? $_POST['phone'] : false;
	$comments = (array_key_exists('comments',$_POST)) ? $_POST['comments'] : false;
	
	// These are the constants that you want applied to ALL emails.	
	$toAddress = 'alice@example.com'; //All emails will get sent to this address
	$subject = 'Website Comment Form';
	$fromAddress = '&quot;Bob Marley&quot; &lt;bob@example.com&gt;';
	
	// Build the email message	
	$emailMsg = &quot;The following information was entered on the website comment form.\n\n&quot;; // \n = newline
	$emailMsg .= &quot;Full Name: $fullName\n\n&quot;;
	$emailMsg .= &quot;eMail: $email\n&quot;;
	$emailMsg .= &quot;Phone: $phone\n\n&quot;;
	$emailMsg .= &quot;Comment: $comments\n&quot;;
		
	$headers = &quot;From: $fromAddress\r\n&quot;;
	$headers .= &quot;Reply-To: $fromAddress\r\n&quot;;
	$delivered = mail($toAddress, $subject, $emailMsg, $headers);
	if ($delivered) {
		$statusMessage = &quot;&lt;p&gt;Thanks for the comment. We will get back to you shortly.&lt;/p&gt;&quot;;
	} else {
		$statusMessage = &quot;&lt;p&gt;Sorry - there was a problem delivering your comments. Please give us a call.&lt;/p&gt;&lt;p&gt;From: &quot;.$email.&quot;&lt;/p&gt;&lt;p&gt;&quot;.$comments.&quot;&lt;/p&gt;&lt;p&gt;Return code=$delivered &lt;/p&gt;&quot;;
	}
}</pre>
</body>
</html>
