'use strict';

const m = require('mithril');
var SmoothLine = require('paths-js/smooth-line');

const {Timeseries} = require('./models');


let Hydrograph = {
    view() {
        return <div>
            <input type="number" id="numDays" value={Timeseries.days} style={{width: '3em'}} onchange={m.withAttr('value', Timeseries.setDays)}/>
            <label for="numDays">Number of days</label>
            <ul>
                {Timeseries.data.map(series => {
                    return m('li', [
                        m('input[type=checkbox]', {
                            id: 'param' + series.code,
                            checked: series.selected,
                            onclick: m.withAttr('checked', Timeseries.setSelected.bind(null, series.code))
                        }),
                        m('label', {
                            for: 'param' + series.code
                        }, series.description)
                    ]);
                })}
            </ul>
            <svg width="500" height="400">
                {Timeseries.data.filter(series => series.selected).map(series => {
                    return Hydrograph.renderSeries(series, 'green');
                })}
            </svg>
            {Timeseries.loading ? 'Loading...': null}
        </div>;
    },
    renderSeries(series, color) {
        var chart = SmoothLine({
            data: [series.plotValues],
            xaccessor: function (data) {
                return data.time;
            },
            yaccessor: function (data) {
                return data.value;
            },
            width: 450,
            height: 350,
            closed: true
        });

        let curve = chart.curves[0];
        var points = curve.line.path.points().map(function (p, i) {
            return <g>
                <circle r={3} cx={p[0]} cy={p[1]} stroke="rgb(120, 129, 194)" fill="white" />
                <title>{series.plotValues[i].label}</title>
            </g>;
        });
        return <g>
            <g transform="translate(30, 0)">
                <path d={ curve.area.path.print() } style={{ opacity: 0.5 }} stroke="none" fill={ color } />
                <path d={ curve.line.path.print() } stroke={ color } fill="none" />
                {points}
            </g>
            <g transform="translate(200, 300)">
                <rect width={20} height={20} style={{fill: color}} />
                <text transform="translate(30, 15)" fontSize={12}>{series.description}</text>
            </g>
        </g>;
    }
};


module.exports = Hydrograph;
