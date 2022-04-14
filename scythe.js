/**
 * @name scythe.js
 * @fileOverview Library to create graphs and tables from data retrieved from the server.
 * @author <a href="mailto:joseph.balsamo@stonybrook.edu">Joseph Balsamo</a>
 * @version 1.0
 * @created 2020-03-01
 */
class Scythe {
    #d3Values = [];
    xfValues = [];
    graphs = [];
    tables = [];

    constructor(datasource,gids,tids) {
        this.d3 = datasource.d3;
        this.xfilter = datasource.xfilter;
        this.config = datasource.config;
        this.data = datasource.data;
        this.gids = gids;
        this.tids = tids;
        this.init();
    }

    print_filter(filter) {
        var f=eval(filter);
        if (typeof(f.length) != "undefined") {}else{}
        if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
        if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
        console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
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
               this.print_filter(this.xfValues[d.name]);
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
    }
}