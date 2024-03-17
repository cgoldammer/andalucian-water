from threading import Lock

class AppState:
    _instance = None
    _lock = Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(AppState, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self.is_mock = False  # Default state

    def set_mock_mode(self, state: bool):
        self.is_mock = state

    def get_mock_mode(self):
        return self.is_mock