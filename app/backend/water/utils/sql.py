q_view = """
SELECT
  rs.date
, volume
, rs.reservoir_id
, r.uuid AS reservoir_uuid
, r.name AS reservoir_name
, capacity, name_full, province, region_id
, rr.name AS region_name
, rf.id IS NOT NULL AS has_rainfall
, rf.amount AS rainfall_amount
, rf.amount_cumulative AS rainfall_cumulative
, rf.amount_cumulative_historical AS rainfall_cumulative_historical
, RANK() OVER (PARTITION BY 1 ORDER BY 1 DESC) AS id
FROM water_reservoirstate rs
JOIN water_reservoir r
ON rs.reservoir_id = r.id
JOIN water_region rr
ON r.region_id = rr.id
LEFT JOIN water_rainfall rf
ON rs.date = rf.date
AND rs.reservoir_id = rf.reservoir_id
"""

q_createview = f"""
DROP VIEW IF EXISTS water_statesmaterialized;
CREATE VIEW water_statesmaterialized AS
{q_view}
"""
