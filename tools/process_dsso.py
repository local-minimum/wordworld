import re
from pathlib import Path

__WORD_LINE = re.compile(r'[0-9a-zåäö]+<[a-zåäö]+>.+')
__SIMPLE_WORD = re.compile(r'^[^- ]*$')
__CLEAN_WORD = re.compile(r'^[a-zåäö]*$')


def get_words_from_line(line):
    _, words = line.split('>', 1)
    for w in words.split(':'):
        if '!' in w:
            continue
        if ',' in w:
            for ww in w.split(','):
                yield ww.strip()
        else:
            yield w.strip()


def get_all_words(fh):
    for line in fh:
        if not __WORD_LINE.match(line):
            continue
        for word in get_words_from_line(line):
            if word:
                yield word


def get_all_simple_words(fh):
    for word in get_all_words(fh):
        if __SIMPLE_WORD.match(word):
            yield word
        else:
            yield


def get_all_cleaned_words(fh):
    for word in get_all_simple_words(fh):
        if word is None:
            continue
        word = word.lower().replace('é', 'e').replace('ü', 'u').replace('è', 'e').replace('à', 'a')
        if __CLEAN_WORD.match(word):
            yield word
        else:
            print(f"Unclean word: {word}")


p = Path('dsso.txt')
with open(p, 'r', encoding='utf8') as f:
    dsso_words = set(get_all_cleaned_words(f))

p = Path('..') / 'wordworld' / 'ord.txt'
with open(p, 'w', encoding='utf8') as f:
    for dsso_word in dsso_words:
        f.write(f'{dsso_word}\n')
