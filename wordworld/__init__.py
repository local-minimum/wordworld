from flask import Flask, send_from_directory, request, jsonify
_CAP_WORD_LENGTH = 10

with open('/app/wordworld/words.txt', 'r') as fh:
    all_words = {
        w.strip() for w in fh.readlines()
        if len(w) <= _CAP_WORD_LENGTH
    }

with open('/app/wordworld/ord.txt', 'r') as fh:
    alla_ord = {
        w.strip() for w in fh.readlines()
        if len(w) <= _CAP_WORD_LENGTH
    }

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
    return jsonify([word.upper() in all_words for word in words])


@app.route('/kolla', methods=["POST"])
def kolla_ord():
    words = request.get_json()
    return jsonify([word.upper() in alla_ord for word in words])