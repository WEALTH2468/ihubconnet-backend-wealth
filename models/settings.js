const mongoose = require("mongoose");

const settingsSchema = mongoose.Schema({
    logo:{type: String, required: true}
    
});

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;