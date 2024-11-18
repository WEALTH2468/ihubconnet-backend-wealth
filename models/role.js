const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    permissions: { type: Array, default: [] },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Role', roleSchema);
