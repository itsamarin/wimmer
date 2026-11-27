import uuid

from sqlalchemy import ForeignKey, JSON, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from wimmer.db.base import Base, TimestampMixin, UUIDMixin


class RecommendationStatus(str):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class Recommendation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "recommendations"

    property_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    organisation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    expected_impact_description: Mapped[str | None] = mapped_column(Text)
    expected_revenue_impact: Mapped[float | None] = mapped_column(Numeric(12, 2))
    expected_occupancy_impact: Mapped[float | None] = mapped_column(Numeric(5, 4))
    confidence_score: Mapped[float | None] = mapped_column(Numeric(4, 3))
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default=RecommendationStatus.PENDING, index=True)
    evidence: Mapped[dict | None] = mapped_column(JSON)
    forecast_references: Mapped[list | None] = mapped_column(JSON)
    llm_reasoning: Mapped[str | None] = mapped_column(Text)
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approval_notes: Mapped[str | None] = mapped_column(Text)

    property: Mapped["Property"] = relationship(back_populates="recommendations")


class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    organisation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255))
    details: Mapped[dict | None] = mapped_column(JSON)
    ip_address: Mapped[str | None] = mapped_column(String(45))
