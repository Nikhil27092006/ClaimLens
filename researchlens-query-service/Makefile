install:
	pip install -r requirements.txt

run:
	uvicorn app.main:app --reload

test:
	pytest -q

unit-test:
	pytest tests/unit -q

integration-test:
	pytest tests/integration -q

lint:
	ruff check .

format:
	ruff format .

services-up:
	docker compose up -d

services-down:
	docker compose down
