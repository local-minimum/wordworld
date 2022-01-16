import os
from . import app

app.run(
    os.environ.get("WORDWORLD_HOST", "127.0.0.1"),
    int(os.environ.get("WORDWORLD_PORT", "5000")),
)