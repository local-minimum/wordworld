from flask import Flask, send_from_directory, request, jsonify
from nltk.corpus import words

all_words = set(words.words())
app = Flask(__name__)


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


@app.route('/check', methods=["POST"])
def check_words():
    words = request.get_json()
    print(words)
    return jsonify([word in all_words for word in words])