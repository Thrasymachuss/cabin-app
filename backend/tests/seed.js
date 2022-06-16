const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Initialize admin user
const seedDb = async function () {
  const salt = await bcrypt.genSalt(10);
  const hashedPswd = await bcrypt.hash("1234", salt);
  const adminBody = {
    firstName: "Admin",
    lastName: "Admin",
    email: "admin@gmail.com",
    role: "admin",
    password: hashedPswd,
  };
  const userBody = {
    firstName: "User",
    lastName: "User",
    email: "user@gmail.com",
    role: "user",
    password: hashedPswd,
  };

  const admin = await User.create(adminBody);
  const user = await User.create(userBody);
  console.log("Finished seeding database...");
  return [admin._id, user._id];
};

module.exports = seedDb;
