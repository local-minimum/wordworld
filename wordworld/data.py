from collections import defaultdict
from random import Random
_CAP_WORD_LENGTH = 10

all_words: dict[int, set[str]] = defaultdict(set)
all_fwords: dict[int, set[str]] = defaultdict(set)
alla_ord: dict[int, set[str]] = defaultdict(set)
alla_ford: dict[int, set[str]] = defaultdict(set)


def store_words(container, fh):
    for w in fh:
        w = w.strip()
        l = len(w)
        if (l > _CAP_WORD_LENGTH):
            continue
        container[l].add(w)


def get_sorted_chars_in_words(container, length=5):
    return {''.join(sorted(w)) for w in container[length]}


def get_target_non_word(game_id, valid, invalid, attempts = 10):
    rng = Random(hash(game_id))
    every = list(valid)
    rng.shuffle(every)
    canditate = [c for c in every[0]]
    rng.shuffle(canditate)
    i = 0
    while (i < attempts):
        wrd = ''.join(canditate)
        if wrd not in invalid:
            return wrd
        i += 1
    return every[0]



with open('/data/words.txt', 'r') as fh:
    store_words(all_words, fh)

with open('/data/ord.txt', 'r') as fh:
    store_words(alla_ord, fh)

with open('/data/fwords.txt', 'r') as fh:
    store_words(all_fwords, fh)
    
five_sorted_chars = get_sorted_chars_in_words(all_fwords)
fem_sorterade_tecken = get_sorted_chars_in_words(alla_ford)
