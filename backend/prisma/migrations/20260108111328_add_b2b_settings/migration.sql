-- CreateTable
CREATE TABLE "b2b_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "description" TEXT,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "new_submissions_notify" BOOLEAN NOT NULL DEFAULT true,
    "contract_updates_notify" BOOLEAN NOT NULL DEFAULT true,
    "invoice_reminders_notify" BOOLEAN NOT NULL DEFAULT true,
    "weekly_digest_notify" BOOLEAN NOT NULL DEFAULT false,
    "default_payment_terms" TEXT,
    "preferred_contract_duration" TEXT,
    "auto_approve_submissions" BOOLEAN NOT NULL DEFAULT false,
    "require_nda" BOOLEAN NOT NULL DEFAULT true,
    "bank_name" TEXT,
    "account_number" TEXT,
    "routing_number" TEXT,
    "minimum_rate" TEXT,
    "service_areas" JSONB,
    "specializations" JSONB,
    "available_for_new_projects" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "b2b_settings_user_id_key" ON "b2b_settings"("user_id");
