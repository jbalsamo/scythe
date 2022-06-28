/**
 * @name scythe.js
 * @fileOverview Library to create graphs and tables from data retrieved from the server.
 * @author <a href="mailto:joseph.balsamo@stonybrook.edu">Joseph Balsamo</a>
 * @version 1.0
 * @created 2020-03-01
 */

const scprint_filter = (filter) => {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}
export default class Scythe {
    d3Values = [];
    xfValues = [];
    graphs = [];
    tables = [];
    ndx = null;

    constructor(datasource,gids,tids) {
        this.d3 = datasource.d3;
        this.xfilter = datasource.xfilter;
        this.config = datasource.config;
        this.data = datasource.data;
        this.gids = gids;
        this.tids = tids;
        this.init();
    }



    init() {
        this.ndx = crossfilter(this.data);
        // Process d3 values
        this.d3.forEach(d => {
            if(d.type == 'parsedate') {
                const parseDate = d3.timeParse(d.format);
                this.data.forEach(e => {
                    e[d.fields[0]] = parseDate(e[d.fields[0]]);
                });
            }
            if(d.type == 'sum') {
                this.data.forEach(e => {
                    e[d.name] = 0;
                    d.fields.forEach(f => {
                        e[d.name] += e[f];
                    });
                });
            }
            if(d.type == 'getFullYear') {
                this.data.forEach(e => {
                    e[d.name] = e[d.fields[0]].getFullYear();
                });
            }
        });

        // Process xfilter values
        this.xfilter.forEach(d => {
            if(d.type == 'dimension') {
                this.xfValues[d.name] = this.ndx.dimension(e => (e[d.dim_field]));
            }
            if(this.xfValues[d.name] != undefined) {
               scprint_filter(this.xfValues[d.name]);
            }

            if(d.type == 'group') {
                if(d.group_method == 'reduceSum') {
                    if(d.field_function == 'return') {
                        this.xfValues[d.name] = this.xfValues[d.dimension].group().reduceSum(e => (e[d.group_field]));
                    } else if(d.field_function == 'pluck') {
                        this.xfValues[d.name] = this.xfValues[d.dimension].group().reduceSum(dc.pluck(d.group_field));
                    }
                }
            }

            if(d.type == 'bottom') {
                this.xfValues[d.name] = this.xfValues[d.dimension].bottom(1)[0][d.field];
            }

            if(d.type == 'top') {
                this.xfValues[d.name] = this.xfValues[d.dimension].top(1)[0][d.field];
            }
        });

        //Process graphs
        this.config.forEach(conf => {
            // console.log(this.xfValues);
            if(conf.type == 'lineChart') {
                this.graphs.push(dc.lineChart(conf.dom_id));
                let lid=this.graphs.length-1;
                this.graphs[lid].width(conf.width)
                    .height(conf.height)
                    .dimension(conf.dimension)
                    .renderArea(conf.renderArea)
                    .brushOn(conf.brushOn)
                    .group(this.xfValues[conf.group.field],conf.group.label)
                    .stack(this.xfValues[conf.stack[0].field],conf.stack[0].label)
                    .stack(this.xfValues[conf.stack[1].field],conf.stack[1].label)
                    .x(d3.scaleTime().domain([this.xfValues['minDate'],this.xfValues['maxDate']]))
                    .yAxisLabel(conf.yAxisLabel)
                    .xAxisLabel(conf.xAxisLabel)
                    .legend(dc.legend().x(conf.legend.x).y(conf.legend.y).itemHeight(conf.legend.itemHeight).gap(conf.legend.gap));

                // if(conf.width != undefined) {
                //     this.graphs[lid].width(conf.width);
                // }
                // if(conf.height != undefined) {
                //     this.graphs[lid].height(conf.height);
                // }
                // if(conf.dimension != undefined) {
                //     this.graphs[lid].dimension(conf.dimension);
                // }
                // if(conf.renderArea != undefined) {
                //     this.graphs[lid].renderArea(conf.renderArea);
                // }
                // if(conf.brushOn != undefined) {
                //     this.graphs[lid].brushOn(conf.brushOn);
                // }
                // if(conf.group != undefined) {
                //     this.graphs[lid].group(this.xfValues[conf.group.field],conf.group.label);
                // }
                // if(conf.stack != undefined) {
                //     conf.stack.forEach(s => {
                //         this.graphs[lid].stack(this.xfValues[s.field],s.label);
                //     });
                // }
                // if(conf.x != undefined) {
                //     if(conf.x.scale != undefined) {
                //         if(conf.x.scale.d3 != undefined) {
                //             this.graphs[lid].x(d3.scaleTime().domain([this.xfValues['minDate'],this.xfValues['maxDate']]));
                //         }
                //     }
                // }
                // if(conf.yAxisLabel != undefined) {
                //     this.graphs[lid].yAxisLabel(conf.yAxisLabel);
                // }
                // if(conf.xAxisLabel != undefined) {
                //     this.graphs[lid].xAxisLabel(conf.xAxisLabel);
                // }
                // if(conf.legend != undefined) {
                //     this.graphs[lid].legend(dc.legend().x(conf.legend.x).y(conf.legend.y).itemHeight(conf.legend.itemHeight).gap(conf.legend.gap));
                // }
                // this.graphs[lid].turnOnControls(true);
                //Event Handlers for testing
                let tgraph = this.graphs[lid];
                console.log("Hello, ",this.xfValues);
                let xf = this.xfValues;
                this.graphs[lid].on('filtered.monitor', function(chart, filter) {
                    if(filter === null) {
                        xf[conf.dimension].filterAll();
                    } else {
                        xf[conf.dimension].filterRange(filter);
                    }
                    dc.renderAll()
                });
            }
            if(conf.type == 'pieChart') {
                this.graphs.push(dc.pieChart(conf.dom_id));
                let lid=this.graphs.length-1;
                if(conf.width != undefined) {
                    this.graphs[lid].width(conf.width);
                }
                if(conf.height != undefined) {
                    this.graphs[lid].height(conf.height);
                }
                if(conf.dimension != undefined) {
                    this.graphs[lid].dimension(conf.dimension);
                }
                if(conf.group != undefined) {
                    this.graphs[lid].group(this.xfValues[conf.group.field]);
                }
                if(conf.innerRadius != undefined) {
                    this.graphs[lid].innerRadius(conf.innerRadius);
                }
                //Event Handlers for testing
                let xf = this.xfValues;
                this.graphs[lid].on('filtered.monitor', function(chart, filter) {
                    if(filter === null) {
                        xf[conf.dimension].filterAll();
                    } else {
                        xf[conf.dimension].filter(filter);
                    }
                    dc.renderAll()
                });
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