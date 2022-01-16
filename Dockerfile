FROM python:3.9
WORKDIR /app
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:5000"
EXPOSE 5000
RUN ["pip", "install", "gunicorn", "flask", "pyenchant"]
COPY wordworld wordworld
CMD ["gunicorn", "wordworld:app"]