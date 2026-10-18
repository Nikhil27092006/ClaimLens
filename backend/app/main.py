from fastapi import FastAPI

app = FastAPI(
    title="FINPILOT API",
    description="Autonomous AI Financial Analyst",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "project": "FINPILOT",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}