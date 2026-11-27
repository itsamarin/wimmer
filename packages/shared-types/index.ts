/**
 * Shared TypeScript types for Wimmer.
 * These mirror the Pydantic schemas in apps/api/wimmer/schemas/.
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subscription_tier: "trial" | "starter" | "professional" | "enterprise";
  is_active: boolean;
  max_properties: number;
}

export interface Property {
  id: string;
  organisation_id: string;
  name: string;
  slug: string;
  property_type: string;
  address: string | null;
  city: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  total_rooms: number;
  stars: number | null;
  is_active: boolean;
  is_demo: boolean;
  timezone: string;
}

export interface DailyPerformance {
  id: string;
  property_id: string;
  date: string;
  rooms_available: number;
  rooms_sold: number;
  occupancy_rate: number;
  room_revenue: number;
  adr: number;
  revpar: number;
  cancellations: number;
  new_bookings: number;
  data_source: string;
  is_validated: boolean;
}

export interface ForecastPoint {
  date: string;
  predicted_value: number;
  lower_bound: number | null;
  upper_bound: number | null;
  confidence_level: number | null;
}

export interface ForecastResponse {
  property_id: string;
  metric: string;
  model_name: string;
  forecast_date: string;
  horizon_days: number;
  points: ForecastPoint[];
  mae: number | null;
  rmse: number | null;
  wape: number | null;
  training_data_days: number;
}

export type RecommendationStatus = "pending" | "approved" | "rejected" | "completed";
export type RiskLevel = "low" | "medium" | "high";
export type RecommendationCategory = "revenue" | "operations" | "staffing" | "procurement" | "marketing";

export interface Recommendation {
  id: string;
  property_id: string;
  organisation_id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  suggested_action: string;
  expected_impact_description: string | null;
  expected_revenue_impact: number | null;
  expected_occupancy_impact: number | null;
  confidence_score: number | null;
  risk_level: RiskLevel;
  status: RecommendationStatus;
  evidence: Record<string, unknown> | null;
  created_at: string;
}

export interface MarketSignal {
  id: string;
  signal_type: string;
  signal_date: string;
  title: string;
  description: string | null;
  impact_level: "low" | "medium" | "high";
  impact_direction: "positive" | "negative" | "neutral";
  source: string;
  is_demo: boolean;
}

export interface ImportResult {
  total_rows: number;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
