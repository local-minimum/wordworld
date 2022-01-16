from flask import Flask, send_from_directory, request, jsonify
import enchant

app = Flask(__name__)
dictionary = enchant.Dict("en_US")


@app.route('/fonts/<path:path>')
def send_fonts(path):
    return send_from_directory('static/fonts', path)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)


@app.route('/')
@app.route('/index.html')
def send_home():
    return send_from_directory('static', 'index.html')


@app.route('/check')
def check_words():
    words = request.get_json()
    return jsonify([dictionary.check(word) for word in words])