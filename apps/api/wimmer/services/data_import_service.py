"""CSV/Excel import and validation service for hotel performance data."""
import io
import uuid
from datetime import date

import pandas as pd
from sqlalchemy.orm import Session

from wimmer.db.models.performance import DailyPerformance
from wimmer.db.models.property import Property
from wimmer.schemas.performance import ImportResult

REQUIRED_COLUMNS = {"date", "rooms_available"}
OPTIONAL_COLUMNS = {"rooms_sold", "room_revenue", "adr", "revpar", "cancellations", "new_bookings", "occupancy"}

COLUMN_ALIASES = {
    "rooms available": "rooms_available",
    "rooms sold": "rooms_sold",
    "room revenue": "room_revenue",
    "total revenue": "room_revenue",
    "revenue": "room_revenue",
    "occ": "occupancy",
    "occ%": "occupancy",
    "occupancy rate": "occupancy",
    "new bookings": "new_bookings",
    "bookings": "new_bookings",
}


def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).lower().strip() for c in df.columns]
    df = df.rename(columns=COLUMN_ALIASES)
    return df


def _validate_row(row: pd.Series, idx: int) -> tuple[DailyPerformance | None, str | None]:
    try:
        raw = str(row["date"]).strip()
        row_date = date.fromisoformat(raw[:10])
    except Exception:
        return None, f"Row {idx}: invalid date '{row.get('date')}'"

    try:
        rooms_available = int(row["rooms_available"])
        if rooms_available <= 0:
            return None, f"Row {idx}: rooms_available must be > 0"
    except Exception:
        return None, f"Row {idx}: invalid rooms_available"

    rooms_sold = int(row.get("rooms_sold", 0) or 0)
    if rooms_sold < 0:
        return None, f"Row {idx}: rooms_sold cannot be negative"
    if rooms_sold > rooms_available:
        return None, f"Row {idx}: rooms_sold ({rooms_sold}) exceeds rooms_available ({rooms_available})"

    room_revenue = float(row.get("room_revenue", 0) or 0)
    if room_revenue < 0:
        return None, f"Row {idx}: room_revenue cannot be negative"

    occupancy = rooms_sold / rooms_available if rooms_available > 0 else 0
    if "occupancy" in row and row["occupancy"] is not None:
        try:
            provided_occ = float(row["occupancy"])
            if provided_occ > 1:
                provided_occ = provided_occ / 100.0
            occupancy = provided_occ
        except Exception:
            pass

    adr_val = room_revenue / rooms_sold if rooms_sold > 0 else 0
    if "adr" in row and row["adr"] is not None:
        try:
            adr_val = float(row["adr"])
        except Exception:
            pass

    revpar_val = room_revenue / rooms_available if rooms_available > 0 else 0
    if "revpar" in row and row["revpar"] is not None:
        try:
            revpar_val = float(row["revpar"])
        except Exception:
            pass

    return DailyPerformance(
        date=row_date,
        rooms_available=rooms_available,
        rooms_sold=rooms_sold,
        occupancy_rate=round(occupancy, 4),
        room_revenue=round(room_revenue, 2),
        adr=round(adr_val, 2),
        revpar=round(revpar_val, 2),
        cancellations=int(row.get("cancellations", 0) or 0),
        new_bookings=int(row.get("new_bookings", 0) or 0),
        is_validated=True,
    ), None


class DataImportService:
    def __init__(self, db: Session):
        self.db = db

    def import_file(self, content: bytes, filename: str, property_obj: Property) -> ImportResult:
        errors: list[str] = []
        warnings: list[str] = []

        try:
            if filename.endswith((".xlsx", ".xls")):
                df = pd.read_excel(io.BytesIO(content))
            else:
                df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            return ImportResult(total_rows=0, imported=0, skipped=0, errors=[f"Could not parse file: {e}"], warnings=[])

        df = _normalise_columns(df)
        df = df.dropna(how="all")

        missing = REQUIRED_COLUMNS - set(df.columns)
        if missing:
            return ImportResult(total_rows=len(df), imported=0, skipped=len(df), errors=[f"Missing required columns: {missing}"], warnings=[])

        total = len(df)
        imported = 0
        skipped = 0

        for idx, row in df.iterrows():
            record, error = _validate_row(row, idx + 2)
            if error:
                errors.append(error)
                skipped += 1
                continue

            existing = (
                self.db.query(DailyPerformance)
                .filter(DailyPerformance.property_id == property_obj.id, DailyPerformance.date == record.date)
                .first()
            )
            if existing:
                warnings.append(f"Row {idx + 2}: duplicate date {record.date} — overwriting")
                for field in ["rooms_available", "rooms_sold", "occupancy_rate", "room_revenue", "adr", "revpar", "cancellations", "new_bookings", "is_validated"]:
                    setattr(existing, field, getattr(record, field))
                existing.source_file = filename
            else:
                record.id = uuid.uuid4()
                record.property_id = property_obj.id
                record.source_file = filename
                self.db.add(record)
            imported += 1

        self.db.commit()
        return ImportResult(total_rows=total, imported=imported, skipped=skipped, errors=errors, warnings=warnings)
