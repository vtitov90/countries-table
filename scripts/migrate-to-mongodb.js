import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Country } from "../models/Country.js";
import { Column } from "../models/Column.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL;

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const dbPath = join(__dirname, "..", "db.json");
    const dbData = JSON.parse(readFileSync(dbPath, "utf-8"));

    if (dbData.countries && Array.isArray(dbData.countries)) {
      console.log(`Migrating ${dbData.countries.length} countries...`);
      for (const country of dbData.countries) {
        try {
          const existing = await Country.findOne({
            $or: [{ id: country.id }, { name: country.name }],
          });
          if (!existing) {
            await Country.create(country);
            console.log(`  ✓ Migrated country: ${country.name}`);
          } else {
            console.log(`  ⊙ Skipped existing country: ${country.name}`);
          }
        } catch (error) {
          console.error(
            `  ✗ Error migrating country ${country.name}:`,
            error.message
          );
        }
      }
    }

    if (dbData.columns && Array.isArray(dbData.columns)) {
      console.log(`Migrating ${dbData.columns.length} columns...`);
      for (const column of dbData.columns) {
        try {
          const existing = await Column.findOne({ id: column.id });
          if (!existing) {
            await Column.create(column);
            console.log(`  ✓ Migrated column: ${column.label}`);
          } else {
            console.log(`  ⊙ Skipped existing column: ${column.label}`);
          }
        } catch (error) {
          console.error(
            `  ✗ Error migrating column ${column.label}:`,
            error.message
          );
        }
      }
    }

    console.log("\nMigration completed!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
