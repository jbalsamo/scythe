function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

let data = [
    {'date': "12/27/2012", 'http_404': 22, 'http_200': 190, 'http_302': 100},
    {'date': "12/28/2012", 'http_404': 2, 'http_200': 10, 'http_302': 100},
    {'date': "12/29/2012", 'http_404': 31, 'http_200': 300, 'http_302': 100},
    {'date': "12/30/2012", 'http_404': 2, 'http_200': 90, 'http_302': 0},
    {'date': "12/31/2012", 'http_404': 25, 'http_200': 90, 'http_302': 0},
    {'date': "01/01/2013", 'http_404': 2, 'http_200': 90, 'http_302': 0},
    {'date': "01/02/2013", 'http_404': 71, 'http_200': 10, 'http_302': 1},
    {'date': "01/03/2013", 'http_404': 12, 'http_200': 90, 'http_302': 0},
    {'date': "01/04/2013", 'http_404': 2, 'http_200': 90, 'http_302': 0},
    {'date': "01/05/2013", 'http_404': 2, 'http_200': 90, 'http_302': 0},
    {'date': "01/06/2013", 'http_404': 42, 'http_200': 200, 'http_302': 1},
    {'date': "01/07/2013", 'http_404': 1, 'http_200': 200, 'http_302': 100}
];

const ogndx = crossfilter(data);
let parseDate = d3.timeParse("%m/%d/%Y");
data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.total= d.http_404+d.http_200+d.http_302;
    d.year=d.date.getFullYear();
});
print_filter("data");
let yearDim  = ogndx.dimension(function(d) {return d.year;});
let year_total = yearDim.group().reduceSum(function(d) {return d.total;});
let dateDim = ogndx.dimension(function(d) {return d.date;});
let hits = dateDim.group().reduceSum(dc.pluck('total'));1
let minDate = dateDim.bottom(1)[0].date;
let maxDate = dateDim.top(1)[0].date;
let status_200=dateDim.group().reduceSum(function(d) {return d.http_200;});
let status_302=dateDim.group().reduceSum(function(d) {return d.http_302;});
let status_404=dateDim.group().reduceSum(function(d) {return d.http_404;});
print_filter("data");
console.log([minDate,maxDate]);

let hitslineChart = dc.lineChart("#chart-line-hitsperday2");
hitslineChart
    .width(500)
    .height(300)
    .dimension(dateDim)
    .group(status_200,"200")
    .stack(status_302,"302")
    .stack(status_404,"404")
    .renderArea(true)
    .x(d3.scaleTime().domain([minDate, maxDate]))
    .brushOn(true)
    .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
    .yAxisLabel("Hits per day")
    .on("filtered.monitor", function(d,filter) {
        console.log(this);
        print_filter(filter);
    });

let yearRingChart   = dc.pieChart("#chart-ring-year2");
yearRingChart
    .width(250).height(250)
    .dimension(yearDim)
    .group(year_total)
    .innerRadius(0)
    .on("filtered.monitor", function(d,filter) {
        console.log(filter);
    });

let datatable   = dc.dataTable("#dc-data-table");
datatable
    .dimension(dateDim)
    .group(function(d) {return d.year;})
    .width(800)
    // dynamic columns creation using an array of closures
    .columns([
        {
            label:'Date',
            format: function(d) { return "<i>"+(d.date.getMonth() + 1) + "/" + d.date.getDate() + "/" +  d.date.getFullYear() + "</i>"; }
        },
        {
            label: 'Status 200',
            format: function(d) {return d.http_200;}
        },
        {
            label: 'Status 302',
            format: function(d) {return d.http_302;}
        },
        {
            label: 'Status 404',
            format: function(d) {return d.http_404;}
        },
        {
            label: 'Total',
            format: function(d) {return d.total;}}
    ]);
dc.renderAll();

console.log("graphs loaded");
console.log(hitslineChart);
console.log(yearRingChart);