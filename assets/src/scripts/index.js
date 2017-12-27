'use strict';


// Initialize 18F design guidelines
require('uswds');


const m = require('mithril');

const Hydrograph = require('./hydrograph');
const Timeseries = require('./models').Timeseries;


document.addEventListener('DOMContentLoaded', function () {
    const app_node = document.getElementById('app');
    if (app_node && app_node.dataset.siteno) {
        // Load data
        Timeseries.siteID = app_node.dataset.siteno;
        Timeseries.refresh();

        // Add the app to the DOM
        m.mount(app_node, Hydrograph);
    }
}, false);
