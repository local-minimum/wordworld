from collections import defaultdict
_CAP_WORD_LENGTH = 10

all_words: dict[int, set[str]] = defaultdict(set)
alla_ord: dict[int, set[str]] = defaultdict(set)


def store_words(container, fh):
    for w in fh:
        w = w.strip()
        l = len(w)
        if (l > _CAP_WORD_LENGTH):
            continue
        container[l].add(w)


def get_sorted_chars_in_words(container, length=5):
    return {''.join(sorted(w)) for w in container[length]}


with open('/data/words.txt', 'r') as fh:
    store_words(all_words, fh)

with open('/data/ord.txt', 'r') as fh:
    store_words(alla_ord, fh)


five_sorted_chars = get_sorted_chars_in_words(all_words)
fem_sorterade_tecken = get_sorted_chars_in_words(alla_ord)
