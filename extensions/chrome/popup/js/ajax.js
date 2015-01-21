// Common function to initialize XML Http Request object 
function getHttpRequestObject()
{
	// Define and initialize as false
	var xmlHttpRequst = false;
	
	// Mozilla/Safari/Non-IE
    if (window.XMLHttpRequest) 
	{
        xmlHttpRequst = new XMLHttpRequest();
    }
    // IE
    else if (window.ActiveXObject) 
	{
        xmlHttpRequst = new ActiveXObject("Microsoft.XMLHTTP");
    }
	return xmlHttpRequst;
}
 
// Does the AJAX call to URL specific with rest of the parameters
function doAjax(url, method, async, responseHandler, data)
{
	// Set the variables
	url = url || "";
	method = method || "GET";
	async = async || true;
	data = data || null;
	
	if(url == "")
	{
		alert("URL can not be null/blank");
		return false;
	}
	var xmlHttpRequst = getHttpRequestObject();
	
	// If AJAX supported
	if(xmlHttpRequst != false)
	{
		// Open Http Request connection
		if(method == "GET")
		{
			url = url + "?" + data;
			data = null;
		}
		xmlHttpRequst.open(method, url, async);
		// Set request header (optional if GET method is used)
		if(method == "POST")
		{
			xmlHttpRequst.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
		// Assign (or define) response-handler/callback when ReadyState is changed.
		xmlHttpRequst.onreadystatechange = responseHandler;
		// Send data
		xmlHttpRequst.send(data);
	}
	else
	{
		alert("Please use browser with Ajax support.!");
	}
}