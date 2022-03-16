/**
 *  @name main.js
 *  @fileOverview Main file for the application. Includes helper and data retrieval functions
 *  @author <a href="mailto:joseph.balsamo@stonybrook.edu">Joseph Balsamo</a>
 *  @version 1.0
 *  @created 2022-03-01
 */

const datasource = [
    {
        xfilter: [
            {
                'id': 1,
                'type': 'dimension',
                'name': 'yearDim',
                'dim_field': 'year',
            },
            {
                'id': 2,
                'type': 'group',
                'dimension': 'yearDim',
                'name': 'yearTotal',
                'field_function': 'return',

            },
            {
                'id': 3,
                'type': 'dimension',
                'name': 'dateDim',
                'dim_field': 'date',
            },
            {
                'id': 4,
                'type': 'bottom',
                'dimension': 'yearDim',
                'field': 'date'
            },
            {
                'id': 5,
                'dimension': 'yearDim',
                'type': 'top',
                'field': 'date'
            },
            {
                'id':  6,
                'type': 'group',
                'dimension': 'yearDim',
                'name': 'hits',
                'group_method': 'reduceSum',
                'field_function': 'pluck',
                'group_field': 'total',
            },
            {
                'id': 7,
                'type': 'group',
                'name': 'status_200',
                'group_method': 'reduceSum',
                'field_function': 'return',
                'group_field': 'date'
            },
            {
                'id': 8,
                'type': 'group',
                'name': 'status_302',
                'group_method': 'reduceSum',
                'field_function': 'return',
                'group_field': 'date'
            },
            {
                'id': 9,
                'type': 'group',
                'name': 'status_404',
                'group_method': 'reduceSum',
                'field_function': 'return',
                'group_field': 'date'
            },
        ],
        config: {
            'type': 'line',
            'dimension': "yearDim",
            'group': "yearGroup"
        },
        data: {
        },
    },
];
