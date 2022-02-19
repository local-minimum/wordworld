from flask import Flask, send_from_directory, request, jsonify, abort
from .data import all_words, alla_ord, five_sorted_chars, fem_sorterade_tecken
app = Flask(__name__)


@app.route('/fonts/<path:path>')
def send_fonts(path):
    return send_from_directory('static/fonts', path)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)


@app.route('/style/<path:path>')
def send_style(path):
    return send_from_directory('static/style', path)


@app.route('/')
@app.route('/index.html')
def send_home():
    return send_from_directory('static', 'index.html')


@app.route('/drewol')
def send_drewol():
    return send_from_directory('static', 'drewol.html')


@app.route('/glidor')
def send_glidor():
    return send_from_directory('static', 'glidor.html')


@app.route('/check', methods=["POST"])
def check_words():
    words = request.get_json()
    return jsonify([word.upper() in all_words[len(word)] for word in words])


@app.route('/kolla', methods=["POST"])
def kolla_ord():
    words = request.get_json()
    return jsonify([word.lower() in alla_ord[len(word)] for word in words])


@app.route('/check/drewol', methods=["POST"])
def check_not_word():
    word = request.get_json()['word'].strip().upper()
    if len(word) != 5 or word in all_words[5]:
        abort(403)
    chrs = ''.join(sorted(word))
    if chrs in five_sorted_chars:
        return '', 204
    abort(404)


@app.route('/kolla/glidor', methods=["POST"])
def kolla_inte_ord():
    word = request.get_json()['word'].strip().lower()
    if len(word) != 5 or word in alla_ord[5]:
        abort(403)
    chrs = ''.join(sorted(word))
    if chrs in fem_sorterade_tecken:
        return '', 204
    abort(404)
