from collections import defaultdict
from random import Random
import logging

logging.basicConfig(level=logging.INFO)
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
        container[l].add(w.lower())


def get_sorted_chars_in_words(container, outlaw, length=5):
    canditates = {''.join(sorted(w)) for w in container[length]}
    return {c for c in canditates if c not in outlaw[length]}


def get_target_non_word(game_id, valid, invalid, attempts = 10):
    rng = Random(hash(game_id))
    every = sorted(list(valid))
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


def load_anagram_resolver(all_words, length=5):
    lookup = defaultdict(list)
    for w in all_words[length]:
        lookup[''.join(sorted(w))].append(w)
    return lookup


with open('/data/words.txt', 'r') as fh:
    store_words(all_words, fh)

with open('/data/ord.txt', 'r') as fh:
    store_words(alla_ord, fh)

with open('/data/fwords.txt', 'r') as fh:
    store_words(all_fwords, fh)

with open('/data/ford.txt', 'r') as fh:
    store_words(alla_ford, fh)

logging.info(f'f-words {len(all_fwords[5])} before filter')
all_fwords[5] = all_fwords[5].intersection(all_words[5])
logging.info(f'f-words {len(all_fwords[5])}')
logging.info(f'f-ord {len(alla_ford[5])} before filter')
alla_ford[5] = alla_ford[5].intersection(alla_ford[5])
logging.info(f'f-ord {len(alla_ford[5])}')
five_sorted_chars = get_sorted_chars_in_words(all_fwords, all_words)
all_five_sorted_chars = get_sorted_chars_in_words(all_words, defaultdict(set))
logging.info(f'f-nonguesses {len(all_five_sorted_chars)}')
fem_sorterade_tecken = get_sorted_chars_in_words(alla_ford, alla_ord)
alla_fem_sorterade_tecken = get_sorted_chars_in_words(alla_ord, defaultdict(set))
logging.info(f'f-nonguesses {len(alla_fem_sorterade_tecken)}')
anagram_words_lookup = load_anagram_resolver(all_fwords)
anagram_ord_lookup = load_anagram_resolver(alla_ford)
