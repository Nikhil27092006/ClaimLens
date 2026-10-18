from time import perf_counter


class Timer:
    def __enter__(self) -> "Timer":
        self.started_at = perf_counter()
        return self

    def __exit__(self, *_: object) -> None:
        self.elapsed_seconds = perf_counter() - self.started_at