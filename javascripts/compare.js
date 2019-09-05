// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback();

/*
* Set configurations and draw the chart
*/
function drawChartCompare() {

    var container = document.getElementById('compareChart');
    // Clear old plots
    container.innerHTML = "";
    // Break the input into multiple steps
    var inputSteps = [getInputCompare('inputCompare1'), getInputCompare('inputCompare2')];
    for (var i = 0; i < inputSteps.length; i++) {
    	if (i % 3 == 0) {
    		var row = createRowDiv();
    		container.appendChild(row);
    	}
    	var chartDiv = createChartDiv(i);
    	row.appendChild(chartDiv);

        try {
            var chart = new google.visualization.LineChart(chartDiv);
	        var [trains, segments] = parseTrains(inputSteps[i]);
            var options = setOptions(segments);
            chart.draw(createDataTable(trains), options);
        }
        catch (error) {
            window.alert(error);
            console.log(error);
        }


    }
}


/*
* Create the row element where the chart divs will be placed
*/
function createRowDiv() {
    var row = document.createElement("div");
    row.style.display = "table-row";
    return row;
}

    /*
    * Create the div element where the chart will be placed
    */
    function createChartDiv(i) {
    	var chartDiv = document.createElement("div");
    	chartDiv.id = "chart_div" + i;
    	chartDiv.style.width = 600;
    	chartDiv.style.height = 450;
    	chartDiv.style.display = "table-cell";
    	return chartDiv;
    }

/*
* Return the input text from the textarea.
*/
function getInputCompare(input_id) {
	return document.getElementById(input_id).value;
}