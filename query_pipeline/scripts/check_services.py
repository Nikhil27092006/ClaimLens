"""Check local Qdrant availability without printing credentials."""

import os
import urllib.request


def main() -> int:
    url = os.getenv("QDRANT_URL", "http://localhost:6333").rstrip("/") + "/healthz"
    try:
        with urllib.request.urlopen(url, timeout=3) as response:
            print(f"Qdrant status: {response.status}")
    except OSError as exc:
        print(f"Qdrant unavailable: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
