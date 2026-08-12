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

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`
    );

    const adminRole = await ensureAdminRole();
    await ensureAdminUser(adminRole);
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDatabase;