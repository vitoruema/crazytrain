
// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback();

/*
* Return the input text from the textarea.
*/
function getInputClassic() {
    return document.getElementById("inputClassic").value;
}

/*
* Set configurations and draw the chart
*/
function drawChartClassic() {
    var input = getInputClassic();
    try {
        var chart = new google.visualization.LineChart(document.getElementById('classicChart'));
	    var [trains, segments] = parseTrains(input);
        var options = setOptions(segments);
        chart.draw(createDataTable(trains), options);
    }
    catch (error) {
        window.alert(error);
        console.log(error);
    }


}
