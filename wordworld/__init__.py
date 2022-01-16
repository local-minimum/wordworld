import os
from flask import Flask, send_from_directory

BASEURL = os.environ.get("WORDWORLD_BASEURL", "/wordz")

app = Flask(__name__)


@app.route('/fonts/<path:path>')
def send_fonts(path):
    send_from_directory('static/fonts', path)


@app.route('/js/<path:path')
def send_js(path):
    send_from_directory('static/js', path)


@app.route('/')
@app.route('/index.html')
def send_home():
    send_from_directory('static', 'index.html')