import logging
from flask import Flask, send_from_directory, request, jsonify, abort
from .data import (
    all_words, alla_ord, five_sorted_chars, fem_sorterade_tecken,
    alla_fem_sorterade_tecken, all_five_sorted_chars,
    anagram_ord_lookup, anagram_words_lookup,
    get_target_non_word
)
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
    logging.info(f'Someone checked {len(words)} words')
    return jsonify([word.lower() in all_words[len(word)] for word in words])


@app.route('/kolla', methods=["POST"])
def kolla_ord():
    words = request.get_json()
    logging.info(f'Someone checked {len(words)} ord')
    return jsonify([word.lower() in alla_ord[len(word)] for word in words])


@app.route('/check/drewol', methods=["POST"])
def check_not_word():
    word = request.get_json()['word'].strip().lower()
    if len(word) != 5 or word in all_words[5]:
        abort(403)
    chrs = ''.join(sorted(word))
    if chrs in all_five_sorted_chars:
        return '', 204
    abort(404)


@app.route('/check/drewol/reverse', methods=["POST"])
def reverse_anagram():
    word = request.get_json()['anagram'].strip().lower()
    logging.info(
        f'Someone reverse checked drewol \'{word}\' got {anagram_words_lookup[word]}',
    )
    return jsonify(anagram_words_lookup[word])


@app.route('/check/drewol/<game>')
def get_drewol_word(game):
    logging.info('Someone started a drewol')
    return jsonify(word=get_target_non_word(game, five_sorted_chars, all_words[5]))


@app.route('/kolla/glidor', methods=["POST"])
def kolla_inte_ord():
    word = request.get_json()['word'].strip().lower()
    if len(word) != 5 or word in alla_ord[5]:
        abort(403)
    chrs = ''.join(sorted(word))
    if chrs in alla_fem_sorterade_tecken:
        return '', 204
    abort(404)


@app.route('/check/glidor/reverse', methods=["POST"])
def bak_anagram():
    word = request.get_json()['anagram'].strip().lower()
    logging.info(f'Someone reverse checked glidor \'{word}\' for {anagram_ord_lookup[word]}')
    return jsonify(anagram_ord_lookup[word])


@app.route('/kolla/glidor/<game>')
def get_glidor_word(game):
    logging.info('Someone started a glidor')
    return jsonify(word=get_target_non_word(game, fem_sorterade_tecken, alla_ord[5]))
