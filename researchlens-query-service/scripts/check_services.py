"""Check optional local service endpoints without exposing credentials."""

import os
import urllib.request


def main() -> int:
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333").rstrip("/")
    try:
        with urllib.request.urlopen(f"{qdrant_url}/healthz", timeout=3) as response:
            print(f"Qdrant: {response.status}")
    except OSError as exc:
        print(f"Qdrant unavailable: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())