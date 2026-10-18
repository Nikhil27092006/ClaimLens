.PHONY: install test run

install:
	python3 -m pip install -r requirements.txt

test:
	pytest -q

run:
	uvicorn backend.app.main:app --reload
