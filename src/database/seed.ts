import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const __filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filePath);

const DEMO_USER_ID = "USER_ID";
const DEMO_USER_NAME = "Demo";
const DEMO_USER_EMAIL = "demo@gmail.com";

// Dates: Jan 1, 2025 to July 24, 2026
const START_DATE = new Date("2025-01-01T08:00:00.000Z").getTime();
const END_DATE = new Date("2026-07-24T16:00:00.000Z").getTime();

function randomTimestamp(start: number, end: number): Date {
  return new Date(start + Math.random() * (end - start));
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTimestamptz(date: Date): string {
  return date.toISOString();
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const CLIENT_NAMES = [
  "Acme Corporation",
  "Apex Dynamics",
  "Horizon Labs",
  "Nexus Media Group",
  "Global Logistics Co",
  "Synergy Digital",
  "CyberPulse Systems",
  "Quantum Tech Solutions",
  "Zenith Software",
  "CloudScale Inc",
  "Vanguard Analytics",
  "ByteCraft Studios",
  "Crestline Partners",
  "NextGen Media",
  "Silverline Tech",
  "Apex Capital",
  "Summit Group",
  "BlueFin Enterprises",
  "Ironclad Security",
  "Pinnacle Innovations",
  "Hyperion Solutions",
  "Starlight Systems",
  "Aura Creative Agency",
  "Velocity Networks",
  "Titan Industries",
  "OmniData Corp",
  "Prism Interactive",
  "Frontier AI",
  "Catalyst Ventures",
  "Echo Digital Labs",
  "Strata Systems",
  "Vivid Design House",
  "Solaris Energy",
  "Beacon Health",
  "Atlas Freight",
  "Nova Softworks",
  "Cascade Cloud",
  "InfiniTech Services",
  "Pulse Media",
  "Keystone Engineering",
  "Aegis Software",
  "Meridian Commerce",
  "Veloce Mobility",
  "Zenith Retail",
  "Orbit Cybernetics",
  "Helios Solar",
  "Terraform Labs",
  "Alpha Communications",
  "Oasis Interactive",
  "Boreal BioTech",
  "Radiant Security",
  "Core Dynamics",
  "Krypton Tech",
  "Vector Analytics",
  "Polypous Partner",
  "Delta Financial",
  "Elysium Media",
  "Zephyr Cloud",
  "Astral Design",
  "Monolith Systems",
  "Sovereign Tech",
  "Vanguard Logistics",
  "Paradigm AI",
  "Lumina Creative",
  "Summit Cloud",
  "HyperScale Labs",
  "Nexus Bio",
  "Crestview Media",
  "Apex Cyber",
  "Infinity Ventures",
  "BlueShift Interactive",
  "Ironclad Networks",
  "Silverstone Partners",
  "Pinnacle Digital",
  "Aura Softworks",
];

const ITEM_DESCRIPTIONS = [
  "Full-stack Web Application Development",
  "UI/UX Design & Prototyping",
  "REST API Integration & Documentation",
  "Cloud Infrastructure Setup & Migration",
  "Monthly Server Maintenance & Support",
  "Database Optimization & Performance Tuning",
  "Mobile Responsive Web Layout",
  "Security Audit & Vulnerability Assessment",
  "SEO Optimization & Analytics Tracking",
  "Custom Dashboard & Reporting Tool",
  "Payment Gateway Integration",
  "Automated Testing & CI/CD Setup",
  "Technical Consulting & System Architecture",
  "Frontend Refactoring & Component Library",
  "GraphQL API Endpoints Development",
  "Microservices Micro-Architecture",
  "Docker Containerization & Kubernetes Setup",
  "Real-time Notification Engine",
  "Third-party API Integration Service",
  "Data Migration & ETL Pipeline",
];

const PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "Stripe",
  "PayPal",
  "Wire Transfer",
  "ACH Transfer",
];

async function generateSeedData() {
  console.log("🌱 Starting 2,000+ Record Database Seed Generation...");

  const sqlStatements: string[] = [];
  sqlStatements.push(`-- Database Seed Script for User ${DEMO_USER_ID}`);
  sqlStatements.push(
    `-- Generated data spanning Jan 1, 2025 to July 24, 2026 with explicit created_at and updated_at timestamps.\n`
  );

  // 1. User Insert/Upsert
  const userCreatedAt = formatTimestamptz(new Date("2025-01-01T00:00:00.000Z"));
  const userSql = `
INSERT INTO users (id, full_name, email, password_hash, currency, is_active, created_at, updated_at)
VALUES (
  '${DEMO_USER_ID}',
  '${DEMO_USER_NAME}',
  '${DEMO_USER_EMAIL}',
  '$2a$10$w8uYQd.7L3gMhF.s1V.w/e7xK9nJ7gN7L3gMhF.s1V.w/e7xK9nJ7',
  'USD',
  TRUE,
  '${userCreatedAt}',
  '${userCreatedAt}'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;
`;
  sqlStatements.push(userSql);

  // 2. Generate 75 Clients
  const clients: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: Date;
  }> = [];
  const clientInserts: string[] = [];

  for (let i = 0; i < CLIENT_NAMES.length; i++) {
    const clientId = crypto.randomUUID();
    const name = CLIENT_NAMES[i];
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const email = `contact@${cleanName}.com`;
    const phone = `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
    const address = `${randomInt(100, 9999)} Business Ave, Suite ${randomInt(100, 900)}, New York, NY 10001`;
    // Clients created between Jan 1, 2025 and May 1, 2025
    const createdAt = randomTimestamp(
      new Date("2025-01-01T08:00:00.000Z").getTime(),
      new Date("2025-05-01T18:00:00.000Z").getTime()
    );
    const createdAtStr = formatTimestamptz(createdAt);

    clients.push({ id: clientId, name, email, phone, address, createdAt });
    clientInserts.push(
      `('${clientId}', '${DEMO_USER_ID}', '${name.replace(/'/g, "''")}', '${email}', '${phone}', '${address.replace(/'/g, "''")}', '${createdAtStr}', '${createdAtStr}')`
    );
  }

  sqlStatements.push(`-- Clients (${clients.length} rows)`);
  sqlStatements.push(
    `INSERT INTO clients (id, user_id, name, email, phone, address, created_at, updated_at) VALUES\n` +
      clientInserts.join(",\n") +
      `;`
  );

  // 3. Generate 2,000 Invoices, Items, and Payments
  const TOTAL_INVOICES = 2000;
  const invoiceInserts: string[] = [];
  const itemInserts: string[] = [];
  const paymentInserts: string[] = [];

  let paymentRefCounter = 100000;

  console.log(`Generating ${TOTAL_INVOICES} invoices, items, and payments...`);

  for (let i = 1; i <= TOTAL_INVOICES; i++) {
    const invoiceId = crypto.randomUUID();
    const client = randomChoice(clients);

    // Ensure invoice createdAt is after client createdAt
    const invCreatedAt = randomTimestamp(client.createdAt.getTime(), END_DATE);
    const issueDateStr = formatDate(invCreatedAt);

    const dueDays = randomInt(14, 30);
    const dueDateObj = new Date(invCreatedAt.getTime() + dueDays * 86400000);
    const dueDateStr = formatDate(dueDateObj);

    // Determine status (ONLY 'PAID', 'UNPAID', 'OVERDUE' - NO 'CANCELLED')
    let status: "PAID" | "UNPAID" | "OVERDUE";
    const isPastDue = dueDateObj.getTime() < END_DATE;

    if (isPastDue) {
      const rand = Math.random();
      if (rand < 0.7) status = "PAID";
      else if (rand < 0.9) status = "OVERDUE";
      else status = "UNPAID";
    } else {
      const rand = Math.random();
      if (rand < 0.55) status = "PAID";
      else status = "UNPAID";
    }

    // Generate 1 to 4 Line Items
    const numItems = randomInt(1, 4);
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const itemId = crypto.randomUUID();
      const desc = randomChoice(ITEM_DESCRIPTIONS);
      const qty = randomChoice([1, 2, 5, 8, 10, 15, 20]);
      const unitPrice = randomChoice([
        45.0, 75.0, 120.0, 150.0, 250.0, 350.0, 500.0, 850.0, 1200.0,
      ]);
      const itemTotal = Number((qty * unitPrice).toFixed(2));

      subtotal += itemTotal;

      const itemCreatedAtStr = formatTimestamptz(invCreatedAt);
      itemInserts.push(
        `('${itemId}', '${invoiceId}', '${desc.replace(/'/g, "''")}', ${qty}, ${unitPrice.toFixed(2)}, ${itemTotal.toFixed(2)}, '${itemCreatedAtStr}')`
      );
    }

    subtotal = Number(subtotal.toFixed(2));
    const tax = Number((subtotal * 0.1).toFixed(2)); // 10% tax
    const total = Number((subtotal + tax).toFixed(2));

    const invoiceNumber = `INV-${invCreatedAt.getFullYear()}-${String(i).padStart(5, "0")}`;
    const notes = `Invoice for professional services provided to ${client.name}.`;

    let invUpdatedAt = invCreatedAt;

    // Generate Payment if PAID
    if (status === "PAID") {
      const paymentId = crypto.randomUUID();
      // Payment date between invCreatedAt and min(dueDate, today)
      const maxPayTime = Math.min(dueDateObj.getTime(), END_DATE);
      const payDate = randomTimestamp(
        invCreatedAt.getTime(),
        maxPayTime > invCreatedAt.getTime() ? maxPayTime : END_DATE
      );
      invUpdatedAt = payDate;

      const payDateStr = formatTimestamptz(payDate);
      const payMethod = randomChoice(PAYMENT_METHODS);
      paymentRefCounter++;
      const refNum = `PAY-2025-${paymentRefCounter}`;

      paymentInserts.push(
        `('${paymentId}', '${invoiceId}', '${DEMO_USER_ID}', ${total.toFixed(2)}, '${payMethod}', '${payDateStr}', '${refNum}', 'Payment received in full.', '${payDateStr}')`
      );
    }

    const invCreatedAtStr = formatTimestamptz(invCreatedAt);
    const invUpdatedAtStr = formatTimestamptz(invUpdatedAt);

    invoiceInserts.push(
      `('${invoiceId}', '${DEMO_USER_ID}', '${client.id}', '${invoiceNumber}', '${status}', '${issueDateStr}', '${dueDateStr}', ${subtotal.toFixed(2)}, ${tax.toFixed(2)}, ${total.toFixed(2)}, '${notes.replace(/'/g, "''")}', '${invCreatedAtStr}', '${invUpdatedAtStr}')`
    );
  }

  // Chunk SQL helper for batch execute
  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const results: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize));
    }
    return results;
  }

  // Build Invoice SQL
  const invChunks = chunkArray(invoiceInserts, 200);
  invChunks.forEach((chunk, index) => {
    sqlStatements.push(`-- Invoices Chunk ${index + 1}`);
    sqlStatements.push(
      `INSERT INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax, total, notes, created_at, updated_at) VALUES\n` +
        chunk.join(",\n") +
        `;`
    );
  });

  // Build Invoice Items SQL
  const itemChunks = chunkArray(itemInserts, 300);
  itemChunks.forEach((chunk, index) => {
    sqlStatements.push(`-- Invoice Items Chunk ${index + 1}`);
    sqlStatements.push(
      `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total, created_at) VALUES\n` +
        chunk.join(",\n") +
        `;`
    );
  });

  // Build Payments SQL
  const payChunks = chunkArray(paymentInserts, 200);
  payChunks.forEach((chunk, index) => {
    sqlStatements.push(`-- Payments Chunk ${index + 1}`);
    sqlStatements.push(
      `INSERT INTO payments (id, invoice_id, user_id, amount, payment_method, payment_date, reference_number, notes, created_at) VALUES\n` +
        chunk.join(",\n") +
        `;`
    );
  });

  const fullSqlContent = sqlStatements.join("\n\n");
  const sqlPath = path.join(__dirname, "seed.sql");
  fs.writeFileSync(sqlPath, fullSqlContent, "utf8");
  console.log(`\n💾 Saved generated SQL to file: ${sqlPath}`);

  // Execute directly on connected Database
  console.log("\n⚡ Connecting to database to execute seed data insertion...");
  const dbClient = await db.pool.connect();

  try {
    await dbClient.query("BEGIN;");

    console.log("Creating/verifying User...");
    await dbClient.query(userSql);

    console.log(`Inserting ${clients.length} Clients...`);
    await dbClient.query(
      `INSERT INTO clients (id, user_id, name, email, phone, address, created_at, updated_at) VALUES\n` +
        clientInserts.join(",\n") +
        `;`
    );

    console.log(`Inserting ${TOTAL_INVOICES} Invoices in batches...`);
    for (const chunk of invChunks) {
      await dbClient.query(
        `INSERT INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax, total, notes, created_at, updated_at) VALUES\n` +
          chunk.join(",\n") +
          `;`
      );
    }

    console.log(`Inserting ${itemInserts.length} Invoice Items in batches...`);
    for (const chunk of itemChunks) {
      await dbClient.query(
        `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total, created_at) VALUES\n` +
          chunk.join(",\n") +
          `;`
      );
    }

    console.log(`Inserting ${paymentInserts.length} Payments in batches...`);
    for (const chunk of payChunks) {
      await dbClient.query(
        `INSERT INTO payments (id, invoice_id, user_id, amount, payment_method, payment_date, reference_number, notes, created_at) VALUES\n` +
          chunk.join(",\n") +
          `;`
      );
    }

    await dbClient.query("COMMIT;");
    console.log("\n✅ Database seeding successfully completed!");
    console.log("Summary of Seeded Data for Demo User (USER_ID):");
    console.log(`  - Clients: ${clients.length}`);
    console.log(`  - Invoices: ${TOTAL_INVOICES}`);
    console.log(`  - Invoice Items: ${itemInserts.length}`);
    console.log(`  - Payments: ${paymentInserts.length}`);
    console.log(`  - Date Range: Jan 1, 2025 to July 24, 2026`);
    console.log(`  - Statuses included: PAID, UNPAID, OVERDUE (CANCELLED excluded)`);
  } catch (err) {
    await dbClient.query("ROLLBACK;");
    console.error("❌ Seeding failed, transaction rolled back:", err);
  } finally {
    dbClient.release();
    await db.pool.end();
  }
}

generateSeedData();
