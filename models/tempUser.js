const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true },
  verificationCode: { type: String, required: true },
  verificationCodeExpiresAt: { type: Date, required: true },
});

// Generate a 6-digit verification code
tempUserSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  return code;
};

tempUserSchema.methods.validateVerificationCode = function (code) {
  return (
    this.verificationCode === code &&
    this.verificationCodeExpiresAt > Date.now()
  );
};

const TempUser = mongoose.model("TempUser", tempUserSchema);

module.exports = TempUser;
