'use strict';


const m = require('mithril');


const Timeseries = {
    loading: false,
    data: [],
    days: 7,
    siteID: null,

    refresh() {
        Timeseries.loading = true;
        m.request({
            method: 'GET',
            url: 'https://waterservices.usgs.gov/nwis/dv/',
            data: {
                sites: Timeseries.siteID,
                period: `P${Timeseries.days}D`,
                indent: 'on',
                parameterCd: '00060',
                siteStatus: 'all',
                format: 'json'
            }
        }).then(function (result) {
            Timeseries.data = result.value.timeSeries.map(series => {
                return {
                    selected: true,
                    code: series.variable.variableCode[0].variableID,
                    description: series.variable.variableDescription,
                    values: series.values,
                    plotValues: series.values[0].value.map(value => {
                        let date = new Date(value.dateTime);
                        return {
                            time: date.getTime(),
                            value: parseInt(value.value),
                            label: `${date.toLocaleDateString()}\n${value.value} ${series.variable.unit.unitCode}`
                        };
                    }),
                    minTime: Math.min(...series.values[0].value.map(value => value.time)),
                    maxTime: Math.max(...series.values[0].value.map(value => value.time)),
                    minValue: Math.min(...series.values[0].value.map(value => value.value)),
                    maxValue: Math.max(...series.values[0].value.map(value => value.value))
                };
            });
            Timeseries.loading = false;
        });
    },

    getViewBox() {
        let maxX = Math.max(...Timeseries.data.map(d => d.maxTime));
        let maxY = Math.max(...Timeseries.data.map(d => d.maxValue));
        return `0 0 ${maxX * 1.1} ${maxY * 1.1}`;
    },

    setSelected(code, selected) {
        let series = Timeseries.data.find(series => series.code === code);
        if (series) {
            series.selected = selected;
        }
    },

    setDays(days) {
        Timeseries.days = days;
        Timeseries.loading = true;
        m.redraw();
        Timeseries.refresh();
    }
};


module.exports = {Timeseries};
