function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("js/samples.json").then((data) => {
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("js/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("js/samples.json").then((data) => {

    // 3. Create a variable that holds the samples array. 
    var sample_arr = data.samples;
    
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultSample = sample_arr.filter(sObj => sObj.id == sample);
    resultSample = resultSample.sort((a, b)=> a.sample_values - b.sample_values);

    // Create a variable that filters the metadata array for the object with the desired sample number.
    var resultMeta = data.metadata.filter(sObj => sObj.id == sample);
    
    //  5. Create a variable that holds the first sample in the array.
    var firstSample = resultSample[0];
    
    // Create a variable that holds the first sample in the metadata array.
    var firstMeta = resultMeta[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = firstSample.otu_ids;
    var otu_labels = firstSample.otu_labels;
    var sample_values = firstSample.sample_values;

    // Create a variable that holds the washing frequency.
    var washFreq = parseFloat(firstMeta.wfreq);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var yticks = otu_ids.slice(0,10).reverse().map(function(otu_id) {
      return "OTU " + otu_id;
    });
    var xticks = sample_values.slice(0,10).reverse()

    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: xticks,
      y: yticks,
      type: "bar",
      orientation: 'h'
    }];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 cultures bacterial found",
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)'
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
    
    // Bubble Chart
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        color: otu_ids,
        size: sample_values
       }
    }];
    var bubbleLayout = {
      title: "Bacterias cultures per sample",
      xaxis: {title: "OTU ID" },
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)'
    };
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    
    // Gauge Chart
    var gData = [{
      domain: { 
        x: [0, 1], 
        y: [0, 1] 
      },
      value: washFreq,
      title: {'text': "scrubs per week", 'font': {'size': 12}},
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        'axis': {'range': [null, 10]},
            'steps' : [
              {'range': [0, 2], 'color': "red"},
              {'range': [2, 4], 'color': "orange"},
              {'range': [4, 6], 'color': "yellow"},
              {'range': [6, 8], 'color': "lightgreen"},
              {'range': [8, 10], 'color': "green"}
            ],
            'bar': {'color': "black"},
      }
    }];
    var gLayout = {
      title: "Belly Button Washing Frequency",
      xaxis: {title: "OTU ID" },
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)'
    };
    Plotly.newPlot("gauge", gData, gLayout);

  });
}
