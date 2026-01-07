-- CreateTable
CREATE TABLE "b2b_requirements" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "required_count" INTEGER NOT NULL DEFAULT 1,
    "proposals_count" INTEGER NOT NULL DEFAULT 0,
    "skills" TEXT[],
    "location" TEXT,
    "budget_min" DOUBLE PRECISION,
    "budget_max" DOUBLE PRECISION,
    "deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_contracts" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "partner_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "terms" TEXT,
    "value" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_placements" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "requirement_id" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "placed_count" INTEGER NOT NULL DEFAULT 0,
    "submissions_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_candidates" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "skills" TEXT[],
    "experience" INTEGER,
    "resume_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_invoices" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "contract_id" TEXT,
    "invoice_no" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "b2b_invoices_invoice_no_key" ON "b2b_invoices"("invoice_no");
