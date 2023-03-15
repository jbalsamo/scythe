/**
 * @name scythe.js
 * @fileOverview Library to create graphs and tables from data retrieved from the server.
 * @author <a href="mailto:joseph.balsamo@stonybrook.edu">Joseph Balsamo</a>
 * @version 1.0
 * @created 2020-03-01
 * @todo
 */

const scprint_filter = (filter) => {
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
};
export default class Scythe {
  d3Values = [];
  xfValues = [];
  graphs = [];
  tables = [];
  ndx = null;

  constructor(datasource) {
    this.d3 = datasource.d3;
    this.xfilter = datasource.xfilter;
    this.config = datasource.config;
    this.data = datasource.data;
    this.init();
  }

  init() {
    this.ndx = crossfilter(this.data);
    // Process d3 values
    this.d3.forEach((d) => {
      if (d.type == "parsedate") {
        const parseDate = d3.timeParse(d.format);
        this.data.forEach((e) => {
          e[d.fields[0]] = parseDate(e[d.fields[0]]);
        });
      }
      if (d.type == "sum") {
        this.data.forEach((e) => {
          e[d.name] = 0;
          d.fields.forEach((f) => {
            e[d.name] += e[f];
          });
        });
      }
      if (d.type == "getFullYear") {
        this.data.forEach((e) => {
          e[d.name] = e[d.fields[0]].getFullYear();
        });
      }
    });

    // Process xfilter values
    this.xfilter.forEach((d) => {
      if (d.type == "dimension") {
        if (d.dim_function != undefined) {
          this.xfValues[d.name] = this.ndx.dimension((e) =>
            d.custom_function(e)
          );
        } else {
          this.xfValues[d.name] = this.ndx.dimension((e) => e[d.dim_field]);
        }
      }
      if (this.xfValues[d.name] != undefined) {
        console.log(
          "🚀 ~ file: scythe.js:89 ~ Scythe ~ this.xfilter.forEach ~ this.xfValues[d.name]:",
          this.xfValues[d.name]
        );
        scprint_filter(this.xfValues[d.name]);
      }

      if (d.type == "group") {
        if (d.group_method == "reduceSum") {
          if (d.field_function == "return") {
            this.xfValues[d.name] = this.xfValues[d.dimension]
              .group()
              .reduceSum((e) => e[d.group_field]);
          } else if (d.field_function == "pluck") {
            this.xfValues[d.name] = this.xfValues[d.dimension]
              .group()
              .reduceSum(dc.pluck(d.group_field));
          } else {
            this.xfValues[d.name] = this.xfValues[d.dimension]
              .group()
              .reduceSum(d.custom_function);
          }
        } else {
          this.xfValues[d.name] = this.xfValues[d.dimension].group();
        }
      }

      if (d.type == "bottom") {
        this.xfValues[d.name] =
          this.xfValues[d.dimension].bottom(1)[0][d.field];
      }

      if (d.type == "top") {
        this.xfValues[d.name] = this.xfValues[d.dimension].top(1)[0][d.field];
      }

      if (d.type == "constant") {
        this.xfValues[d.name] = d.value;
      }
    });

    //Process graphs
    this.config.forEach((conf) => {
      // console.log(this.xfValues);
      // Bar Chart
      if (conf.type == "barChart") {
        let lid = this.graphs.push(dc.barChart(conf.dom_id)) - 1;
        console.log(lid);

        if (conf.width != undefined) {
          this.graphs[lid].width(conf.width);
        }
        if (conf.height != undefined) {
          this.graphs[lid].height(conf.height);
        }
        if (conf.dimension != undefined) {
          this.graphs[lid].dimension(this.xfValues[conf.dimension]);
        }
        if (conf.renderArea != undefined) {
          this.graphs[lid].renderArea(conf.renderArea);
        }
        if (conf.brushOn != undefined) {
          this.graphs[lid].brushOn(conf.brushOn);
        }
        if (conf.group != undefined) {
          this.graphs[lid].group(
            this.xfValues[conf.group.field],
            conf.group.label
          );
        }
        if (conf.x != undefined) {
          if (conf.x.scale != undefined) {
            if (conf.x.scale.d3 != undefined) {
              this.graphs[lid].x(
                d3
                  .scaleTime()
                  .domain([this.xfValues["minDate"], this.xfValues["maxDate"]])
              );
            }
          }
        }
        if (conf.yAxisLabel != undefined) {
          this.graphs[lid].yAxisLabel(conf.yAxisLabel);
        }
        if (conf.xAxisLabel != undefined) {
          this.graphs[lid].xAxisLabel(conf.xAxisLabel);
        }
        if (conf.xUnits != undefined) {
          this.graphs[lid].xUnits(() => conf.xUnits);
        }
        if (conf.legend != undefined) {
          this.graphs[lid].legend(
            dc
              .legend()
              .x(conf.legend.x)
              .y(conf.legend.y)
              .itemHeight(conf.legend.itemHeight)
              .gap(conf.legend.gap)
          );
        }
        this.graphs[lid].turnOnControls(true);
        // Event Handlers for testing
        let xf = this.xfValues;
        this.graphs[lid].on("filtered.monitor", function (chart, filter) {
          // console.log("in bar chart Handler");
          // if (filter === null) {
          //   xf[conf.dimension].filter(null);
          // } else {
          //   xf[conf.dimension].filterRange(filter);
          // }
          dc.renderAll();
        });
      }
      // Line Chart
      if (conf.type == "lineChart") {
        let lid = this.graphs.push(dc.lineChart(conf.dom_id)) - 1;
        console.log(lid);
        scprint_filter(this.xfValues[conf.group.field]);
        if (conf.width != undefined) {
          this.graphs[lid].width(conf.width);
        }
        if (conf.height != undefined) {
          this.graphs[lid].height(conf.height);
        }
        if (conf.dimension != undefined) {
          this.graphs[lid].dimension(this.xfValues[conf.dimension]);
          console.log(this.xfValues);
        }
        if (conf.renderArea != undefined) {
          this.graphs[lid].renderArea(conf.renderArea);
        }
        if (conf.brushOn != undefined) {
          this.graphs[lid].brushOn(conf.brushOn);
        }
        if (conf.group != undefined) {
          this.graphs[lid].group(
            this.xfValues[conf.group.field],
            conf.group.label
          );
          console.log("Line graph: ");
          scprint_filter(this.xfValues[conf.group.field]);
        }
        if (conf.stack != undefined) {
          conf.stack.forEach((s) => {
            this.graphs[lid].stack(this.xfValues[s.field], s.label);
          });
        }
        if (conf.x != undefined) {
          if (conf.x.scale != undefined) {
            if (conf.x.scale.d3 != undefined) {
              this.graphs[lid].x(
                d3
                  .scaleTime()
                  .domain([this.xfValues["minDate"], this.xfValues["maxDate"]])
              );
              this.graphs[lid].xUnits(d3.timeDays);
            }
          }
        }
        if (conf.yAxisLabel != undefined) {
          this.graphs[lid].yAxisLabel(conf.yAxisLabel);
        }
        if (conf.xAxisLabel != undefined) {
          this.graphs[lid].xAxisLabel(conf.xAxisLabel);
        }
        if (conf.legend != undefined) {
          this.graphs[lid].legend(
            dc
              .legend()
              .x(conf.legend.x)
              .y(conf.legend.y)
              .itemHeight(conf.legend.itemHeight)
              .gap(conf.legend.gap)
          );
        }
        this.graphs[lid].turnOnControls(true);

        // Event Handlers for testing
        let xf = this.xfValues;
        this.graphs[lid].on("filtered.monitor", function (chart, filter) {
          // console.log("in Line chart Handler");
          // if (filter === null) {
          //   xf[conf.dimension].filter(null);
          // } else {
          //   xf[conf.dimension].filterRange(filter);
          // }
          dc.renderAll();
        });
      }
      // Scatter plot Chart
      if (conf.type == "scatterplot") {
        let lid = this.graphs.push(dc.scatterPlot(conf.dom_id)) - 1;
        console.log("In Scatterplot");
        scprint_filter(this.xfValues[conf.group.field]);
        if (conf.width != undefined) {
          this.graphs[lid].width(conf.width);
        }
        if (conf.height != undefined) {
          this.graphs[lid].height(conf.height);
        }
        if (conf.symbolSize != undefined) {
          this.graphs[lid].symbolSize(conf.symbolSize);
        }
        if (conf.clipPadding != undefined) {
          this.graphs[lid].clipPadding(conf.clipPadding);
        }
        if (conf.dimension != undefined) {
          this.graphs[lid].dimension(this.xfValues[conf.dimension]);
          console.log("dimension:");
          scprint_filter(this.xfValues[conf.dimension]);
        }
        if (conf.renderArea != undefined) {
          this.graphs[lid].renderArea(conf.renderArea);
        }
        if (conf.brushOn != undefined) {
          this.graphs[lid].brushOn(conf.brushOn);
        }
        if (conf.group != undefined) {
          this.graphs[lid].group(
            this.xfValues[conf.group.field],
            conf.group.label
          );
          scprint_filter(this.xfValues[conf.group.field]);
        }
        if (conf.x != undefined) {
          if (conf.x.scale != undefined) {
            if (conf.x.scale.d3 != undefined) {
              console.log("Scale type: " + conf.x.scale.d3.type);
              if (conf.x.scale.d3.type != undefined) {
                {
                  if (conf.x.scale.d3.type == "scaleTime") {
                    this.graphs[lid].x(
                      d3
                        .scaleTime()
                        .domain([
                          this.xfValues["minDate"],
                          this.xfValues["maxDate"],
                        ])
                    );
                  } else if (conf.x.scale.d3.type == "scaleLinear") {
                    this.graphs[lid].x(
                      d3
                        .scaleLinear()
                        .domain([
                          this.xfValues["minPercent"],
                          this.xfValues["maxPercent"],
                        ])
                    );
                  }
                }
              }
            }
          }
        }
        if (conf.yAxisLabel != undefined) {
          this.graphs[lid].yAxisLabel(conf.yAxisLabel);
        }
        if (conf.xAxisLabel != undefined) {
          this.graphs[lid].xAxisLabel(conf.xAxisLabel);
        }
        if (conf.legend != undefined) {
          this.graphs[lid].legend(
            dc
              .legend()
              .x(conf.legend.x)
              .y(conf.legend.y)
              .itemHeight(conf.legend.itemHeight)
              .gap(conf.legend.gap)
          );
        }
        this.graphs[lid].turnOnControls(true);

        // Event Handlers for testing
        let xf = this.xfValues;
        this.graphs[lid].on("filtered.monitor", function (chart, filter) {
          // console.log("in ScatterPlot chart Handler");
          // console.log("🚀 ~ file: scythe.js:389 ~ Scythe ~ filter:", filter);
          dc.renderAll();
        });
      }
      // Pie Chart
      if (conf.type == "pieChart") {
        let lid = this.graphs.push(dc.pieChart(conf.dom_id)) - 1;
        console.log(lid);
        if (conf.width != undefined) {
          this.graphs[lid].width(conf.width);
        }
        if (conf.height != undefined) {
          this.graphs[lid].height(conf.height);
        }
        if (conf.cx != undefined) {
          this.graphs[lid].cx(conf.cx);
        }
        if (conf.dimension != undefined) {
          this.graphs[lid].dimension(this.xfValues[conf.dimension]);
        }
        if (conf.group != undefined) {
          this.graphs[lid].group(this.xfValues[conf.group.field]);
        }
        if (conf.innerRadius != undefined) {
          this.graphs[lid].innerRadius(conf.innerRadius);
        }
        //Event Handlers for testing
        let xf = this.xfValues;
        let g = this.graphs[lid];
        // this.graphs[lid]
        //   .on("filtered.monitor", function (chart, filter) {
        //     console.log(filter);
        //     console.log(g.filter());
        //     console.log("In Pie Chart");
        //     // if(filter == []) {
        //     //     xf[conf.dimension].filterAll();
        //     // } else {
        //     //     xf[conf.dimension].filter(filter);
        //     // }
        //     // dc.renderAll()
        //   })
        //   .on("renderlet", function (chart) {
        //     chart.selectAll("rect").on("click", function (d) {
        //       console.log("click!", d);
        //     });
        //   });
      }
      // Data Table
      if (conf.type == "dataTable") {
        console.log("Building Datatable!");

        let lid = this.graphs.push(dc.dataTable("#dc-data-table-2")) - 1;
        console.log(lid);

        if (conf.width != undefined) {
          this.graphs[lid].width(conf.width);
        }
        if (conf.height != undefined) {
          this.graphs[lid].height(conf.height);
        }
        if (conf.dimension != undefined) {
          this.graphs[lid].dimension(this.xfValues[conf.dimension]);
        }
        if (conf.group != undefined) {
          this.graphs[lid].group(conf.group);
        }
        if (conf.columns != undefined) {
          this.graphs[lid].columns(conf.columns);
        }
      }
    });
    dc.renderAll();
  }

  return_data() {
    return this.data;
  }

  return_graphs() {
    return this.graphs;
  }

  return_xfValues() {
    return this.xfValues;
  }
}
