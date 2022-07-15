
let dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"];

var urlBase = "https://api.weather.com/v3/wx/forecast/daily/3day?";
var urlParameterGEOCODE = "geocode=";
var urlParameterIACO = "icaoCode=";
var urlEnd = "&format=json&units=e&language=en-US&apiKey=";

let dataDelimiter = "\t";
let lineDelimiter = "\n";
let defaultMissingValue = "na";

var cityCount = 0;
var progressCount = 0;
var observationArray = [];

var resultText = "";

var downloadDate = "XXXX";

// ------------------------------------------

function getFourDigitDayAndMonth(plusNumber) {
	
 const today = new Date();
 const date = new Date(today);
 date.setDate(date.getDate() + plusNumber);
	
  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  
  // return month + '/' + day + '/' + year;
  
  // return month + '/' + day;
  downloadDate = month.toString() + day.toString();
}

// ------------------------------------------

function getKey() {
		
	let aKey = document.getElementById("apiKey").value;
			
	if (aKey.length == 32) {		
		document.getElementById("buttonsDiv").style.visibility = 'visible';
		document.getElementById('badKey').style.display = 'none';
	} else {
		document.getElementById("buttonsDiv").style.visibility = 'hidden';
		document.getElementById('resultsDiv').style.display = 'none';
		document.getElementById('badKey').style.display = 'block';
	}
}

// ------------------------------------------
// enterKeyPressed checks for the return key
// when entering your API code
// ------------------------------------------


function enterKeyPressed(event) {
	if (event.keyCode == 13) {
        document.activeElement.blur();
	}
}

// ------------------------------------------
/* https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server */
// ------------------------------------------

function downloadTextFile() {
	deleteBlankLines();
	
	let textFileName = "UScitydata" + downloadDate + ".txt";
	
	download(textFileName, document.getElementById('dataText').value);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// ------------------------------------------

function copyText() {
	
	deleteBlankLines();
	
     //select the element with the id "copyMe", must be a text box
     var textToCopy = document.getElementById("dataText");
     //select the text in the text box
     textToCopy.select();
     //copy the text to the clipboard
     document.execCommand("copy");
     
     document.getElementById("textCopiedVerification").style.display = 'block';
}


// ------------------------------------------

function deleteBlankLines() {
 var stringArray = document.getElementById('dataText').value.split('\n');
 var temp = [""];
 var x = 0;

 for (var i = 0; i < stringArray.length; i++) {
   if (stringArray[i].trim() != "") {
     temp[x] = stringArray[i];
     x++;
   }
 }

 temp = temp.join('\n');
 document.getElementById('dataText').value = temp;
}

// ------------------------------------------

function resetResultsInterface() {
	resultText = "";
	observationArray.length = 0;

	document.getElementById("dataText").value = "";
	document.getElementById("dataText").style.visibility = 'hidden';
	
	document.getElementById('resultsDiv').style.display = 'block';
	document.getElementById("copyButtonDiv").style.display = 'none';
	document.getElementById("textCopiedVerification").style.display = 'none';	
	
	document.getElementById("downloadTextButton").style.visibility = 'hidden';
}

function loopThroughCities(citiesObject, days, aKey, isForMainMap) {
	
	resetResultsInterface();

	if (days == 1) {
		document.getElementById("forecastDays").innerHTML = "Forecast for " + getTomorrowDayOfWeek();
	} else if (isForMainMap == true && days == 2) {
		document.getElementById("forecastDays").innerHTML = "Bulldog Main Map Forecast for " + 	getDayTwoDayOfWeek();
	}
	 else if (days == 2) {
		document.getElementById("forecastDays").innerHTML = "Forecast for " + getTomorrowDayOfWeek() + " and " + 	getDayTwoDayOfWeek();
	}

	cityCount = Object.keys(citiesObject).length;
	progressCount = 0;
	console.log("Now looking up data for " + cityCount + " cities...");
	document.getElementById("loader").style.display = 'block';

	for (var airportCode in citiesObject) {
		getCityData(airportCode, citiesObject[airportCode], days, aKey, isForMainMap);	
	}
	
}

// ------------------------------------------

function getCityData(aCode, locationName, days, aKey, isForMainMap) {

var fullURL = "";

if (aCode.length == 4) {
	fullURL = urlBase + urlParameterIACO + aCode + urlEnd + aKey;
} else {
	fullURL = urlBase + urlParameterGEOCODE + aCode + urlEnd + aKey;
}

let tomorrowDayOfWeek = getTomorrowDayOfWeek();

fetch(fullURL)
            //Response resolves to a readable stream, 
            //so this statement helps us convert it into 
            //a static object
            .then(response => response.json()) 
            //Now that we have the data, let us see what it looks like in console
            .then(responseData => {
	            // console.log(responseData);
	            // console.log(responseData.dayOfWeek);
	            
	            console.log(responseData.daypart[0].iconCode);
	            
	            // Get data for next two days
	            let dayOneIndex = responseData.dayOfWeek.indexOf(tomorrowDayOfWeek);
	            
	            let dayOneIconNumber = responseData.daypart[0].iconCode[dayOneIndex * 2];
	            let dayTwoIconNumber = responseData.daypart[0].iconCode[dayOneIndex * 2 + 2];
	            
                console.log(responseData.temperatureMax);
                console.log(responseData.temperatureMin);
                
                if (isForMainMap == true && days == 1) {
	                
	                resultText = locationName + dataDelimiter + (responseData.temperatureMax[dayOneIndex] ?? defaultMissingValue) +"/"+ (responseData.temperatureMin[dayOneIndex] ?? defaultMissingValue) + lineDelimiter;
	                
				} else if (isForMainMap == true && days == 2) {
	                
	                resultText = locationName + dataDelimiter + (responseData.temperatureMax[dayOneIndex + 1] ?? defaultMissingValue) +"/"+ (responseData.temperatureMin[dayOneIndex + 1] ?? defaultMissingValue) + lineDelimiter;
	                
                } else if (days == 2) {
                
                resultText = locationName + dataDelimiter + (wxIcons[dayOneIconNumber] ?? defaultMissingValue) + dataDelimiter + (responseData.temperatureMax[dayOneIndex] ?? defaultMissingValue) + dataDelimiter + (responseData.temperatureMin[dayOneIndex] ?? defaultMissingValue) + dataDelimiter + (wxIcons[dayTwoIconNumber] ?? defaultMissingValue) + dataDelimiter + (responseData.temperatureMax[dayOneIndex + 1] ?? defaultMissingValue) + dataDelimiter + responseData.temperatureMin[dayOneIndex + 1] + lineDelimiter;
                
                } else if (days == 1) {
	                
	            resultText = locationName + dataDelimiter + (wxIcons[dayOneIconNumber] ?? defaultMissingValue) + dataDelimiter + (responseData.temperatureMax[dayOneIndex] ?? defaultMissingValue) + dataDelimiter + (responseData.temperatureMin[dayOneIndex] ?? defaultMissingValue) + lineDelimiter;

	                
                }
                                
                                observationArray.push(resultText);
                                
                                // document.getElementById("dataText").value = document.getElementById("dataText").value + resultText;
                             
								progressCount++;
								
								if (progressCount >= cityCount) {
									document.getElementById("loader").style.display = 'none';
									document.getElementById("dataText").style.visibility = 'visible';
									document.getElementById("copyButtonDiv").style.display = 'block';

									observationArray.sort((a, b) => a.localeCompare(b));
									// console.log(observationArray);
									
									if (isForMainMap == true) {
										document.getElementById("downloadTextButton").style.visibility = 'visible';
										
										// reorder array based on main map order
										
										var tempReorderedArray = [];
										
										for (let j = 0; j < usCitiesMainMapArray.length; j++) {	
											
											for (let i = 0; i < observationArray.length; i++) {										
												if (observationArray[i].includes(usCitiesMainMapArray[j])) {
													tempReorderedArray.push(observationArray[i]);
													break;
												}
											}
											
										}
										
										getFourDigitDayAndMonth(days);
										document.getElementById("dataText").value = tempReorderedArray.join("");
										
										
									} else {
										document.getElementById("downloadTextButton").style.visibility = 'hidden';
										document.getElementById("dataText").value = observationArray.join("");
									}
									


								}

            });
            
}

function getTomorrowDayOfWeek() {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	return dayArray[tomorrow.getDay()];
}

function getDayTwoDayOfWeek() {
	const today = new Date();
	const twoDaysAway = new Date(today);
	twoDaysAway.setDate(twoDaysAway.getDate() + 2);
	return dayArray[twoDaysAway.getDay()];
}
