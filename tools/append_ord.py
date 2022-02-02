def get_clean_extra_words(fh):
    for line in fh:
        _, word, *_ = line.split(',')
        if __CLEAN_WORD.match(word):
            yield word