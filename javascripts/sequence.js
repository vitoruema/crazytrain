// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback();

/*
* Set configurations and draw the chart
*/

function drawChartSequence() {
    var container = document.getElementById('sequenceChart');
    // Clear old plots
    container.innerHTML = "";
    // Break the input into multiple steps
    var inputSteps = getInputSequence().split("===");

    for (var i = 0; i < inputSteps.length; i++) {
    console.log(inputSteps[i]);
        if (i % 3 == 0) {
            var row = createRowDiv();
            container.appendChild(row);
        }
        var chartDiv = createChartDiv(i);
        row.appendChild(chartDiv);

        try {
            var chart = new google.visualization.LineChart(chartDiv);
	        var [trains, segments] = parseTrains(inputSteps[i].trim());
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
    chartDiv.style.width = 400;
    chartDiv.style.height = 300;
    chartDiv.style.display = "table-cell";
    return chartDiv;
}

/*
* Return the input text from the textarea.
*/
function getInputSequence() {
    return document.getElementById('inputSequence').value;
}