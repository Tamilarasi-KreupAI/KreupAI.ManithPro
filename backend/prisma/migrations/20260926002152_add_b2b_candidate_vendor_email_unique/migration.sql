-- Migration: add unique constraint (vendorId, email) to b2b_candidates
-- WS14-T06: Prevent duplicate candidate emails per vendor

CREATE UNIQUE INDEX IF NOT EXISTS "b2b_candidates_vendor_id_email_key"
    ON "b2b_candidates" ("vendor_id", "email");
