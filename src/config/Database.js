import mongoose from "mongoose";
import roleRepository from "../modules/auth/role/role.repository.js";
import userService from "../modules/user/user.service.js";

const ensureAdminRole = async () => {
  const existing = await roleRepository.findBySlug("admin");

  if (existing) {
    return existing;
  }

  const role = await roleRepository.create({
    name: "ADMIN",
    displayName: "Administrator",
    slug: "admin",
    description: "System administrator role",
    priority: 1,
    level: 1,
    isDefault: false,
    isSystem: true,
    canLoginAdmin: true,
    canLoginWebsite: true,
    status: "ACTIVE",
    permissions: [],
  });

  console.log("✅ Admin role seeded");
  return role;
};

const ensureAdminUser = async (adminRole) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existingAdmin = await userService.findByEmail(adminEmail);

  if (existingAdmin) {
    let updated = false;

    const hasAdminRole = existingAdmin.roles?.some(
      (role) => role._id.toString() === adminRole._id.toString(),
    );

    if (!hasAdminRole) {
      const updatedRoles = [
        ...new Set([
          ...existingAdmin.roles.map((role) => role._id.toString()),
          adminRole._id.toString(),
        ]),
      ].map((id) => new mongoose.Types.ObjectId(id));

      await userService.update(existingAdmin._id, {
        roles: updatedRoles,
        canLoginAdmin: true,
      });

      updated = true;
      console.log(`✅ Admin role assigned to existing user: ${adminEmail}`);
    }

    const passwordMatches = existingAdmin.password
      ? await existingAdmin.comparePassword(adminPassword)
      : false;

    if (!passwordMatches) {
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      updated = true;
      console.log(`✅ Admin password reset for existing user: ${adminEmail}`);
    }

    if (!existingAdmin.isEmailVerified) {
      existingAdmin.isEmailVerified = true;
      existingAdmin.emailVerifiedAt = new Date();
      await existingAdmin.save();
      updated = true;
      console.log(`✅ Admin email marked verified: ${adminEmail}`);
    }

    if (!updated) {
      console.log(`✅ Existing admin user is already configured: ${adminEmail}`);
    }

    return;
  }

  await userService.createUser({
    firstName: "Admin",
    lastName: "User",
    email: adminEmail,
    password: adminPassword,
    roles: [adminRole._id],
    status: "ACTIVE",
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
    canLoginAdmin: true,
  });

  console.log(`✅ Admin user seeded: ${adminEmail}`);
};

let isConnecting = null;

const connectDatabase = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // If connection is in progress, await the existing promise
  if (isConnecting) {
    return isConnecting;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const errorMsg =
      "MONGODB_URI is not set. Please add your MongoDB Atlas connection string in Vercel Project Settings > Environment Variables.";
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (process.env.VERCEL && (uri.includes("127.0.0.1") || uri.includes("localhost"))) {
    const errorMsg =
      "MONGODB_URI points to localhost. Vercel cloud serverless functions cannot reach your local machine. Please add a MongoDB Atlas cloud URI to your Vercel Environment Variables.";
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  isConnecting = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(async (connection) => {
      console.log(
        `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`
      );

      // Ensure admin role and user if needed
      try {
        const adminRole = await ensureAdminRole();
        await ensureAdminUser(adminRole);
      } catch (seedErr) {
        console.warn("⚠️ Admin seeding note:", seedErr.message);
      }

      return connection;
    })
    .catch((error) => {
      console.error("❌ Database Connection Failed:", error.message);
      isConnecting = null;
      if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
        process.exit(1);
      }
      throw error;
    });

  return isConnecting;
};

export default connectDatabase;