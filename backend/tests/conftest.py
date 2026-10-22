import pytest
from app.db.session import init_db, engine, Base
from app.core.config import settings

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    settings.ALLOW_LOCAL_URLS_FOR_TESTING = True
    init_db()
    yield
    # Teardown
    Base.metadata.drop_all(bind=engine)
