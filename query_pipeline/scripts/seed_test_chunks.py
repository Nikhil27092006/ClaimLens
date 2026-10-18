import json
from pathlib import Path


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "tests" / "fixtures" / "chunks.json"
    print(json.dumps(json.loads(path.read_text()), indent=2))
