import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    const adminEmail = "admin@example.com";
    const adminPassword = "password";

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingAdmin.length > 0) {
      console.log("⚠️  Admin user already exists. Skipping...");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);

    const [admin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password: password");
    console.log("👤 Role:", admin.role);
    console.log("🆔 ID:", admin.id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
