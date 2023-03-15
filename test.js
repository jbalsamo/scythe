import Scythe from "./scythe.js";

const ds = [
  {
    d3: [
      {
        id: 1,
        name: "date",
        type: "parsedate",
        format: "%m/%d/%Y",
        fields: ["date"],
      },
      {
        id: 2,
        name: "total",
        type: "sum",
        fields: ["http_404", "http_200", "http_302"],
      },
      {
        id: 3,
        name: "year",
        type: "getFullYear",
        fields: ["date"],
      },
    ],
    xfilter: [
      {
        id: 1,
        name: "yearDim",
        type: "dimension",
        dim_field: "year",
      },
      {
        id: 11,
        name: "analysisDim",
        type: "dimension",
        dim_function: "custom",
        custom_function: (d) => {
          let percent = (d.http_200 / d.total) * 100;
          return [percent, +d.http_200];
        },
      },
      {
        id: 2,
        name: "dateDim",
        type: "dimension",
        dim_field: "date",
      },
      {
        id: 12,
        name: "analysisGroup",
        type: "group",
        dimension: "analysisDim",
        group_method: "group",
      },
      {
        id: 13,
        name: "minPercent",
        type: "constant",
        value: 0,
      },
      {
        id: 14,
        name: "maxPercent",
        type: "constant",
        value: 100,
      },
      {
        id: 3,
        name: "dateGroup",
        type: "group",
        dimension: "dateDim",
        group_method: "reduceSum",
        field_function: "custom",
        custom_function: function (d) {
          return d.http_200 + d.http_302 + d.http_404;
        },
      },
      {
        id: 4,
        name: "yearTotal",
        type: "group",
        dimension: "yearDim",
        group_method: "reduceSum",
        field_function: "return",
        group_field: "total",
      },
      {
        id: 5,
        name: "minDate",
        type: "bottom",
        dimension: "dateDim",
        field: "date",
      },
      {
        id: 6,
        name: "maxDate",
        type: "top",
        dimension: "dateDim",
        field: "date",
      },
      {
        id: 7,
        name: "hits",
        type: "group",
        dimension: "yearDim",
        group_method: "reduceSum",
        field_function: "pluck",
        group_field: "total",
      },
      {
        id: 8,
        type: "group",
        name: "status_200",
        dimension: "dateDim",
        group_method: "reduceSum",
        field_function: "return",
        group_field: "http_200",
      },
      {
        id: 9,
        type: "group",
        name: "status_302",
        dimension: "dateDim",
        group_method: "reduceSum",
        field_function: "return",
        group_field: "http_302",
      },
      {
        id: 10,
        type: "group",
        name: "status_404",
        dimension: "dateDim",
        group_method: "reduceSum",
        field_function: "return",
        group_field: "http_404",
      },
    ],
    config: [
      {
        id: 1,
        name: "hitsLineChart",
        dom_id: "#chart-line-hitsperday",
        type: "lineChart",
        width: 500,
        height: 300,
        renderArea: true,
        brushOn: true,
        dimension: "dateDim",
        group: {
          field: "status_200",
          label: "200",
        },
        stack: [
          {
            field: "status_302",
            label: "302",
          },
          {
            field: "status_404",
            label: "404",
          },
        ],
        x: {
          scale: {
            d3: {
              id: 1,
              name: "xScale",
              type: "scaleTime",
              function: "domain",
              min: "minDate",
              max: "maxDate",
            },
          },
        },
        yAxisLabel: "Hits per day",
        xAxisLabel: "Date",
        legend: {
          x: 50,
          y: 10,
          itemHeight: 13,
          gap: 5,
        },
      },
      {
        id: 2,
        name: "yearRingChart",
        dom_id: "#chart-ring-year",
        type: "pieChart",
        width: 250,
        height: 250,
        margins: 20,
        cx: 125,
        dimension: "yearDim",
        group: {
          field: "yearTotal",
        },
        innerRadius: 0,
      },
      {
        id: 3,
        name: "hitsBarChart",
        dom_id: "#chart-bar-hitsperday",
        type: "barChart",
        width: 500,
        height: 300,
        brushOn: true,
        dimension: "dateDim",
        group: {
          field: "dateGroup",
          label: "Hits",
        },
        x: {
          scale: {
            d3: [
              {
                id: 1,
                name: "xScale",
                type: "scaleTime",
                function: "domain",
                min: "minDate",
                max: "maxDate",
              },
            ],
          },
        },
        yAxisLabel: "Hits per day",
        xAxisLabel: "Date",
        xUnits: 12,
        legend: {
          x: 50,
          y: 10,
          itemHeight: 13,
          gap: 5,
        },
      },
      {
        id: 4,
        type: "dataTable",
        name: "dataTable2",
        dom_id: "#dc-data-table-2",
        dimension: "dateDim",
        group: function (d) {
          return d.year;
        },
        width: 800,
        columns: [
          {
            label: "Date",
            format: function (d) {
              return (
                "<i>" +
                (d.date.getMonth() + 1) +
                "/" +
                d.date.getDate() +
                "/" +
                d.date.getFullYear() +
                "</i>"
              );
            },
          },
          {
            label: "Status 200",
            format: function (d) {
              return d.http_200;
            },
          },
          {
            label: "Status 302",
            format: function (d) {
              return d.http_302;
            },
          },
          {
            label: "Status 404",
            format: function (d) {
              return d.http_404;
            },
          },
          {
            label: "Total",
            format: function (d) {
              return d.total;
            },
          },
        ],
      },
      {
        id: 5,
        name: "hitsScatterChart",
        dom_id: "#chart-scatterplot",
        type: "scatterplot",
        width: 500,
        height: 300,
        symbolSize: 5,
        clipPadding: 10,
        dimension: "analysisDim",
        assoc_dimension: ["dateDim", "yearDim"],
        group: {
          field: "analysisGroup",
          label: "Percent",
        },
        x: {
          scale: {
            d3: {
              id: 1,
              name: "xScale",
              type: "scaleLinear",
              function: "domain",
              min: "minPercent",
              max: "maxPercent",
            },
          },
        },
        yAxisLabel: "Hits Per Day",
        xAxisLabel: "Percentage of Hits",
      },
    ],
    data: [
      { date: "12/27/2012", http_404: 22, http_200: 190, http_302: 100 },
      { date: "12/28/2012", http_404: 2, http_200: 10, http_302: 100 },
      { date: "12/29/2012", http_404: 31, http_200: 300, http_302: 100 },
      { date: "12/30/2012", http_404: 2, http_200: 90, http_302: 0 },
      { date: "12/31/2012", http_404: 25, http_200: 90, http_302: 0 },
      { date: "01/01/2013", http_404: 2, http_200: 90, http_302: 0 },
      { date: "01/02/2013", http_404: 71, http_200: 10, http_302: 1 },
      { date: "01/03/2013", http_404: 12, http_200: 90, http_302: 0 },
      { date: "01/04/2013", http_404: 2, http_200: 90, http_302: 0 },
      { date: "01/05/2013", http_404: 2, http_200: 90, http_302: 0 },
      { date: "01/06/2013", http_404: 42, http_200: 200, http_302: 1 },
      { date: "01/07/2013", http_404: 1, http_200: 200, http_302: 110 },
    ],
  },
];

function print_filter(filter) {
  let f = eval(filter);
  if (typeof f.length != "undefined") {
  } else {
  }
  if (typeof f.top != "undefined") {
    f = f.top(Infinity);
  } else {
  }
  if (typeof f.dimension != "undefined") {
    f = f
      .dimension(function (d) {
        return "";
      })
      .top(Infinity);
  } else {
  }
  console.log(
    filter +
      "(" +
      f.length +
      ") = " +
      JSON.stringify(f)
        .replace("[", "[\n\t")
        .replace(/}\,/g, "},\n\t")
        .replace("]", "\n]")
  );
}

const mySc = new Scythe(ds[0]);

console.log(mySc.return_xfValues());
