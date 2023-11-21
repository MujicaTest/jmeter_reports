/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 75.575, "KoPercent": 24.425};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6844375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.977, 500, 1500, "Obtain Token 7"], "isController": false}, {"data": [0.976, 500, 1500, "Obtain Token 6"], "isController": false}, {"data": [0.0, 500, 1500, "Obtain Token 8"], "isController": false}, {"data": [0.792, 500, 1500, "Obtain Token 3"], "isController": false}, {"data": [0.865, 500, 1500, "Obtain Token 2"], "isController": false}, {"data": [0.971, 500, 1500, "Obtain Token 5"], "isController": false}, {"data": [0.8945, 500, 1500, "Obtain Token 4"], "isController": false}, {"data": [0.0, 500, 1500, "Obtain Token 1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8000, 1954, 24.425, 1429.895499999997, 67, 54958, 292.0, 4846.0, 5108.95, 5540.949999999999, 0.05015981669997864, 0.1023638663593634, 0.019201804830460575], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Obtain Token 7", 1000, 12, 1.2, 301.3279999999998, 84, 3799, 280.0, 376.9, 441.0, 651.8900000000001, 0.006270036803924732, 0.013517201286762662, 0.0024002484640024365], "isController": false}, {"data": ["Obtain Token 6", 1000, 10, 1.0, 306.97399999999965, 83, 3952, 280.0, 387.69999999999993, 450.89999999999986, 635.97, 0.0062700439589646936, 0.013525470636945236, 0.002400251203041172], "isController": false}, {"data": ["Obtain Token 8", 1000, 785, 78.5, 4361.640999999992, 2712, 6149, 4376.0, 5064.9, 5275.849999999999, 5747.6900000000005, 0.006289493261251379, 0.011297010903861756, 0.002407696639072794], "isController": false}, {"data": ["Obtain Token 3", 1000, 174, 17.4, 500.5690000000001, 67, 5094, 235.0, 1266.1, 2686.7499999999995, 4353.490000000001, 0.006288548448256965, 0.012915990702733278, 0.0024073349528483693], "isController": false}, {"data": ["Obtain Token 2", 1000, 116, 11.6, 427.85500000000025, 76, 5427, 234.0, 368.79999999999995, 2101.349999999999, 4089.8, 0.006287764351996619, 0.013157982000255926, 0.002407034790998706], "isController": false}, {"data": ["Obtain Token 5", 1000, 20, 2.0, 307.0920000000002, 85, 4542, 273.0, 380.79999999999995, 449.7999999999997, 1555.0100000000027, 0.006277900717209978, 0.013503120712664653, 0.0024032588683069447], "isController": false}, {"data": ["Obtain Token 4", 1000, 94, 9.4, 422.71900000000016, 77, 54958, 236.5, 373.0, 864.2499999999881, 3760.7400000000002, 0.006287360083053512, 0.013235095594830317, 0.0024068800317939222], "isController": false}, {"data": ["Obtain Token 1", 1000, 743, 74.3, 4810.985999999999, 3177, 6236, 4909.0, 5362.7, 5578.7, 6081.98, 0.006289491916289002, 0.011411730294730936, 0.002407696124204383], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["429/Too Many Requests", 1954, 100.0, 24.425], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8000, 1954, "429/Too Many Requests", 1954, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Obtain Token 7", 1000, 12, "429/Too Many Requests", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 6", 1000, 10, "429/Too Many Requests", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 8", 1000, 785, "429/Too Many Requests", 785, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 3", 1000, 174, "429/Too Many Requests", 174, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 2", 1000, 116, "429/Too Many Requests", 116, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 5", 1000, 20, "429/Too Many Requests", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 4", 1000, 94, "429/Too Many Requests", 94, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtain Token 1", 1000, 743, "429/Too Many Requests", 743, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
