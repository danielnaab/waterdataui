
from flask import render_template

from . import app, __version__


@app.route('/')
def home():
    return render_template('index.html', version=__version__)


@app.route('/monitoring-location/<site_no>')
def monitoring_location(site_no):
    return render_template(
        'monitoring_location.html',
        version=__version__,
        site_no=site_no
    )
