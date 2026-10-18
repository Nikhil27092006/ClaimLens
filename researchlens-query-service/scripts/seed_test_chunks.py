"""Print a deterministic seed payload for local fake-provider development."""

import json

from pathlib import Path


def main() -> None:
    fixture = Path(__file__).parents[1] / "tests" / "fixtures" / "chunks.json"
    print(json.dumps(json.loads(fixture.read_text()), indent=2))


if __name__ == "__main__":
    main()