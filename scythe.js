/**
 * @name scythe.js
 * @fileOverview Library to create graphs and tables from data retrieved from the server.
 * @author <a href="mailto:joseph.balsamo@stonybrook.edu">Joseph Balsamo</a>
 * @version 1.0
 * @created 2020-03-01
 */
class Scythe {
    #d3Values = [];
    #xfValues = [];
    #graphs = [];
    #tables = [];

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
        //console.log(this.data);
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
                    //console.log(e['date']);
                    e[d.name] = e[d.fields[0]].getFullYear();
                });
            }
        });

        // Process xfilter values
        this.xfilter.forEach(d => {});
    }
}

//export default Scythe;