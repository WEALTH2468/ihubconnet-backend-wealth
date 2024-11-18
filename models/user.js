const mongoose = require('mongoose');
const Post = require('./post');
const Comment = require('./comment');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = mongoose.Schema(
    {
        lastLogin: {type: Date},
        background: { type: String },
        avatar: { type: String },
        role: { type: String },
        displayName: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        gender: { type: String },
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        departments: { type: Array, default: [] },
        units: { type: Array, default: [] },
        unitsMembers: { type: Array, default: [] },
        jobPosition: { type: String },
        email: { type: String, unique: true, required: true },
        emails: { type: Array, default: [] },
        phoneNumbers: { type: Array, default: [] },
        address: { type: String },
        city: { type: String },
        birthday: { type: Date },
        aboutMe: { type: String },
        password: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
        status: {
            type: String,
            enum: ['online', 'away', 'offline'],
            default: 'offline',
        },

        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        passwordChangeAt: { type: Date },
    },
    { timestamps: true }
);

userSchema.pre('findOneAndDelete', async function (next) {
    const user = await this.model.findOne(this.getFilter());

    await Promise.all([Post.deleteMany({ userId: user._id }), Comment.deleteMany({ userId: user._id })] )

    next();
});

userSchema.post('findOneAndUpdate', async function (result) {
    const user = result;
    const bulkOps = [
        {
            updateMany: {
                filter: { userId: user?._id },
                update: {
                    $set: {
                        user: { name: user?.displayName, avatar: user?.avatar },
                    },
                },
            },
        },
    ];
    await Promise.all([Post.bulkWrite(bulkOps), Comment.bulkWrite(bulkOps)])
});

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    console.log(resetToken, this.passwordResetToken, this.passwordResetExpires);

    return resetToken;
};

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
