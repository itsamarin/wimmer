"""Tests for CSV data import service."""
import uuid
from io import BytesIO

import pandas as pd
import pytest

from wimmer.db.models.organisation import Organisation, OrganisationMember
from wimmer.db.models.property import Property
from wimmer.services.data_import_service import DataImportService


@pytest.fixture
def demo_property(db):
    org = Organisation(id=uuid.uuid4(), name="Test Org", slug=f"test-import-{uuid.uuid4().hex[:6]}", max_properties=10)
    db.add(org)
    db.flush()
    prop = Property(id=uuid.uuid4(), organisation_id=org.id, name="Test Hotel", slug="test-hotel", total_rooms=100)
    db.add(prop)
    db.commit()
    return prop


def _make_csv(rows: list[dict]) -> bytes:
    df = pd.DataFrame(rows)
    return df.to_csv(index=False).encode()


def test_import_valid_csv(db, demo_property):
    rows = [
        {"date": "2024-01-01", "rooms_available": 100, "rooms_sold": 70, "room_revenue": 7000},
        {"date": "2024-01-02", "rooms_available": 100, "rooms_sold": 85, "room_revenue": 8500},
    ]
    result = DataImportService(db).import_file(_make_csv(rows), "test.csv", demo_property)
    assert result.imported == 2
    assert result.skipped == 0
    assert len(result.errors) == 0


def test_import_invalid_date(db, demo_property):
    rows = [{"date": "not-a-date", "rooms_available": 100, "rooms_sold": 70}]
    result = DataImportService(db).import_file(_make_csv(rows), "test.csv", demo_property)
    assert result.skipped == 1
    assert len(result.errors) == 1


def test_import_rooms_sold_exceeds_available(db, demo_property):
    rows = [{"date": "2024-02-01", "rooms_available": 50, "rooms_sold": 100}]
    result = DataImportService(db).import_file(_make_csv(rows), "test.csv", demo_property)
    assert result.skipped == 1


def test_import_missing_required_column(db, demo_property):
    rows = [{"rooms_sold": 70}]
    result = DataImportService(db).import_file(_make_csv(rows), "test.csv", demo_property)
    assert result.imported == 0
    assert len(result.errors) > 0


def test_import_duplicate_overwrites(db, demo_property):
    rows = [{"date": "2024-03-01", "rooms_available": 100, "rooms_sold": 60}]
    DataImportService(db).import_file(_make_csv(rows), "test.csv", demo_property)
    rows2 = [{"date": "2024-03-01", "rooms_available": 100, "rooms_sold": 80}]
    result = DataImportService(db).import_file(_make_csv(rows2), "test.csv", demo_property)
    assert result.imported == 1
    assert len(result.warnings) == 1
