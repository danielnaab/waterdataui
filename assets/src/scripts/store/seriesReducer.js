const merge = require('lodash/merge');
const omitBy = require('lodash/omitBy');

/*
 * Case reducers
 */

const addTimeSeriesCollection = function(series, action) {
    return merge({}, series, action.data);
};

const resetTimeSeries = function(series, action) {
    return {
        ...series,
        timeSeries: omitBy(series.timeSeries, (tsValue) => tsValue.tsKey === action.key),
        requests: {
            ...(series || {}).requests,
            [action.key]: {}
        }
    };
};

const addIanaTimeZone = function(series, action) {
    return {
        ...series,
        ianaTimeZone: action.ianaTimeZone
    };
};

/*
 * Slice reducer
 */

export const seriesReducer = function(series={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES_COLLECTION': return addTimeSeriesCollection(series, action);
        case 'RESET_TIMESERIES': return resetTimeSeries(series, action);
        case 'SET_LOCATION_IANA_TIME_ZONE': return addIanaTimeZone(series, action);
        default: return series;
    }
};
