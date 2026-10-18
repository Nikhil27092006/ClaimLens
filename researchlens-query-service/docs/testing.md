# Testing

Run the suite from the service directory:

```bash
pytest -q
```

Unit tests use deterministic functions and fake providers. Integration tests
cover the FastAPI health route and the fake end-to-end query pipeline. Real
provider tests should be added only with service credentials supplied through
the environment.