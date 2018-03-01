const { createSelector, createStructuredSelector } = require('reselect');
const { line } = require('d3-shape');
const { select } = require('d3-selection');

const { Actions } = require('./store');
const { dataSelector } = require('./timeseries');
const { sparkLineDim } = require('./layout');
const { createXScale, simplifiedYScale } = require('./scales');
const { dispatch, link } = require('../../lib/redux');


/**
 * Returns metadata for each available timeseries.
 * @param  {Object} state Redux state
 * @return {Array}        Sorted array of [code, metadata] pairs.
 */
export const availableTimeseriesSelector = createSelector(
    state => state.tsData,
    state => state.currentParameterCode,
    (tsData, currentCd) => {
        const codes = {};
        for (let key of Object.keys(tsData).sort()) {
            for (let code of Object.keys(tsData[key])) {
                codes[code] = codes[code] || {};
                codes[code] = {
                    description: codes[code].description || tsData[key][code].description,
                    type: codes[code].type || tsData[key][code].type,
                    selected: currentCd === code,
                    currentYear: key === 'current' || codes[code].currentYear === true,
                    previousYear: key === 'compare' || codes[code].previousYear === true,
                    medianData: key === 'medianStatistics' || codes[code].medianData === true
                };
            }
        }
        let sorted = [];
        for (let key of Object.keys(codes).sort()) {
            sorted.push([key, codes[key]]);
        }
        return sorted;
    }
);

/**
 * Draw a sparkline in a selected SVG element
 *
 * @param svgSelection
 * @param tsData
 */
const addSparkLine = function(svgSelection, {tsData}) {
    const { parmData, lines } = tsData;
    if (parmData && lines) {
        let x = createXScale(parmData, sparkLineDim.width);
        let y = simplifiedYScale(parmData, sparkLineDim.height);
        let spark = line()
            .x(function(d) {
                return x(d.time);
            })
            .y(function(d) {
                return y(d.value);
            });
        for (let lineSegment of lines) {
            svgSelection.append('path')
                .attr('d', spark(lineSegment.points))
                .attr('class', 'spark-line');
        }
    }
};


/**
 * Draws a table with clickable rows of timeseries parameter codes. Selecting
 * a row changes the active parameter code.
 * @param  {Object} elem                d3 selection
 * @param  {Object} availableTimeseries Timeseries metadata to display
 */
export const plotSeriesSelectTable = function (elem, {availableTimeseries}) {
    elem.select('#select-timeseries').remove();

    const table = elem
        .append('table')
            .attr('id', 'select-timeseries')
            .classed('usa-table-borderless', true);

    table.append('caption').text('Select a timeseries');

    table.append('thead')
        .append('tr')
            .selectAll('th')
            .data(['Parameter Code', 'Description', 'Now', 'Last Year', 'Median', 'Graph'])
            .enter().append('th')
                .attr('scope', 'col')
                .text(d => d);

    table.append('tbody')
        .selectAll('tr')
        .data(availableTimeseries)
        .enter().append('tr')
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'TimeseriesGraph')
            .attr('ga-event-action', 'selectTimeSeries')
            .classed('selected', parm => parm[1].selected)
            .on('click', dispatch(function (parm) {
                if (!parm[1].selected) {
                    return Actions.setCurrentParameterCode(parm[0]);
                }
            }))
            .call(tr => {
                tr.append('td')
                    .attr('scope', 'row')
                    .text(parm => parm[0]);
                tr.append('td')
                    .text(parm => parm[1].description);
                tr.append('td')
                    .html(parm => parm[1].currentYear ? '<i class="fa fa-check" aria-label="Current year data available"></i>' : '');
                tr.append('td')
                    .html(parm => parm[1].previousYear ? '<i class="fa fa-check" aria-label="Previous year data available"></i>' : '');
                tr.append('td')
                    .html(parm => parm[1].medianData ? '<i class="fa fa-check" aria-label="Median data available"></i>' : '');
                tr.append('td')
                    .append('svg')
                    .attr('width', sparkLineDim.width.toString())
                    .attr('height', sparkLineDim.height.toString());
            });

    table.selectAll('tbody svg').each(function(d) {
        let selection = select(this);
        let parmCd = d[0];
        selection.call(link(addSparkLine, createStructuredSelector(
            {tsData: dataSelector(parmCd)}
        )));
    });
};
