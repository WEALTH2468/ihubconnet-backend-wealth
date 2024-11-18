const Role = require("../../models/role");

async function createDefaultRolesIfAbsent() {
  const roles = await Role.find({});
  if (roles.length === 0) {
    console.log("Creating default roles...");
    const adminRole = new Role({
      name: "Admin",
      description: "Admin Role",
      permissions: [
        "create",
        "update",
        "delete",
        "delete_user",
        "update_user",
        "create_user",
        "assign_role",
        "modify_permission",
        "modify_document",
      ],
    });
    const teamLeadRole = new Role({
      name: "Team Lead",
      description: "Team Lead Role",
      permissions: [
        "create",
        "update",
        "delete",
        "update_user",
        "modify_document",
      ],
    });
    const userRole = new Role({
      name: "User",
      description: "User Role",
      permissions: [
        "create_own",
        "update_own",
        "delete_own",
        "modify_shared_document",
        "modify_assigned_task",
      ],
    });
    const guestRole = new Role({
      name: "Guest",
      description: "Guest Role",
      permissions: [],
    });
    await adminRole.save();
    await teamLeadRole.save();
    await userRole.save();
    await guestRole.save();
  }
}

module.exports = { createDefaultRolesIfAbsent };
