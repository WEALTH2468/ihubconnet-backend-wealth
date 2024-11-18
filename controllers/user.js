const bcrypt = require('bcrypt');
const Role = require('../models/role');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { sendMail } = require('../utils/sendMail');
const { HandleError } = require('../utils/error');
const { CatchErrorFunc } = require('../utils/CatchErrorFunc');
const crypto = require('crypto');
const { error } = require('console');
const { Error } = require('mongoose');
// const sgMail = require("@sendgrid/mail");
// const { error } = require('console');
// const initSocketIO = require("../websocket")

const signToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.access_token, {
    expiresIn: process.env.expire_time,
  });
};

const getUserWithUnitsMembers = async (userId) => {
  try {
    // Find the user based on userId
    const userNewData = await User.findOne({ _id: userId }).lean();
    const roleData = await Role.findOne({ _id: userNewData.roleId }).lean();
    if (roleData) {
      userNewData.role = roleData.name.toLowerCase();
    }
    if (!userNewData) {
      throw new Error('User not found');
    }

    // Find unitsMembers based on the units field of the found user
    const unitsMembers = await User.find(
      {
        units: { $in: userNewData.units },
        _id: { $ne: userNewData._id },
      },
      { displayName: 1, _id: 1, units: 1, avatar: 1 }
    );

    delete userNewData.password;

    userNewData.unitsMembers = unitsMembers;

    return userNewData;
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

exports.getUsers = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (userId == 'undefined') {
      const users = await User.find({}, { password: 0 });
      return res.status(200).json(users);
    }

    const user = await getUserWithUnitsMembers(userId);

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getUsersForChatSideBar = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const users = await User.find({ _id: { $ne: userId } }, { password: 0 });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.refresh = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    const user = await getUserWithUnitsMembers(userId);

    const access_token = signToken(user._id);

    return res.status(200).json({ access_token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { email, displayName, password, roleId } = req.body;
    const userNewData = await User.findOne({ email }).lean();

    if (!!userNewData) {
      return res.status(500).json([
        {
          type: 'email',
          message: 'The email address is already in use',
        },
      ]);
    }

    const hash = await hashPassword(password);

    const newUser = new User({
      displayName,
      email,
      emails: [{ email: req.body.email, label: 'primary' }],
      phoneNumbers: [
        {
          country: 'ng',
          phoneNumber: '',
          label: '',
        },
      ],
      password: hash,
      roleId,
      role: 'user',
      status: 'offline',
    });
    const userSaved = await newUser.save();

    const user = await getUserWithUnitsMembers(userSaved._id);

    const access_token = signToken(user._id);

    return res.status(200).json({ access_token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.user);
    const url = req.protocol + '://' + req.get('host');

    Object.keys(req.files).forEach((key, index) => {
      data[key] = url + '/images/' + req.files[key][0].filename;
    });

    const {
      background,
      avatar,
      role,
      displayName,
      email,
      emails,
      phoneNumbers,
      address,
      firstName,
      lastName,
      departmentId,
      units,
      aboutMe,
      gender,
      jobPosition,
      city,
      birthday,
      password,
      isActive,
    } = data;

    const userNewData = await User.findOne({ email }).lean();

    if (!!userNewData) {
      return res.status(500).json([
        {
          type: 'email',
          message: 'The email address is already in use',
        },
      ]);
    }

    const hash = await hashPassword(password);

    const newUser = new User({
      background,
      avatar,
      role,
      displayName,
      email,
      emails,
      phoneNumbers,
      address,
      firstName,
      lastName,
      departmentId,
      units,
      aboutMe,
      gender,
      jobPosition,
      city,
      birthday,
      password: hash,
      isActive,
    });
    const addedUser = await newUser.save();

    return res.status(200).json({
      addedUser,
      message: 'User Added Successfully!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userNewData = await User.findOne({ email }).lean();

    if (!userNewData) {
      return res.status(400).json([
        {
          type: 'email',
          message: 'User not Found !',
        },
      ]);
    }

    const isMatch = await bcrypt.compare(password, userNewData.password);
    if (!isMatch) {
      return res.status(400).json([
        {
          type: 'email',
          message: 'Incorrect Crendentials',
        },
      ]);
    }

    const user = await getUserWithUnitsMembers(userNewData._id);

    const access_token = signToken(user._id);

    return res.status(200).json({
      access_token,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res, next) => {
  try {
    const { userId: authId } = req.auth;

    const userId = req.params.id;
    const userNewData = JSON.parse(req.body.user);
    const user = await User.findOne({
      email: userNewData.emails[0]?.email,
    }).lean();

    if (authId == userId && userNewData.newPassword) {
      if (!userNewData.password) {
        return res.status(400).json([
          {
            type: 'password',
            message:
              'Please provide your former password to create New password!',
          },
        ]);
      }
      const isMatch = await bcrypt.compare(userNewData.password, user.password);

      if (!isMatch) {
        return res.status(400).json([
          {
            type: 'password',
            message:
              'Please provide your former password to create New password!',
          },
        ]);
      }

      const hash = await hashPassword(userNewData.newPassword);
      userNewData.password = hash;
    } else if (userNewData.newPassword) {
        userNewData.password = await hashPassword(userNewData.newPassword);
    }else{
      delete userNewData.password
    }


    Object.keys(req.files).forEach((key, index) => {
      if (userNewData[key]) {
        const fileName = userNewData[key].split('/images/')[1];
        fs.unlink('images/' + fileName, () => {
          userNewData[key] = '/images/' + req.files[key][0].filename;
        });
      }

      userNewData[key] = '/images/' + req.files[key][0].filename;
    });

    const userUpdated = await User.findOneAndUpdate(
      {_id:userId}, // find the user by id
      userNewData,
      { new: true } // updated data
    );
    console.log('updated:', userUpdated);

    const updatedUser = await getUserWithUnitsMembers(userUpdated._id);

    if (userNewData.newPassword) {
      updatedUser.newPassword = userNewData.newPassword;
    }

    return res.status(200).json({
      updatedUser,
      message: 'Updated successfully!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  const userId = req.params.id;
  try {
    const deleteUser = await User.findByIdAndRemove({ _id: userId });
    if (!deleteUser) {
      return res.status(404).json({ error: 'User no found' });
    }
    return res.status(200).json({ message: 'User deleted Successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    // Update user status to "offline"

    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//Reset password code WEALTH
exports.forgetpassword = CatchErrorFunc(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new HandleError(400, 'User with this email is not found', 400);
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ ValidateBeforeSave: false });

  const resetUrl = `${req.get('origin')}/auth/reset-password/${resetToken}`;

  const message =
    'Forgot password? click on this link to reset your password ' +
    resetUrl +
    ' this link will be valid for only 10min.';
  console.log(message);

  try {
    await sendMail({
      email: user.email,
      subject: 'Reset password',
      message: message,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent successfully',
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    user.save({ ValidateBeforeSave: false });

    res.status(500).json({
      success: false,
      message: 'Unable to send mail',
    });
  }
});

exports.reset_password = async (req, res) => {
  //Checking if the user exist with the given token and if the token has expired

  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  }).lean();

  if (!user) {
    return res.status(400).json({ message: 'Link is invalid or expired' });
  }

  //  Reseting the user password
  try {
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    if (user.confirmPassword !== user.password) {
      return res.status(400).json({ message: 'Your passwords do not match' });
    }

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.confirmPassword = undefined;
    user.passwordChangedAt = Date.now();

    const hash = await hashPassword(user.password);
    user.password = hash;

    const userUpdated = await User.findByIdAndUpdate(
      user._id, // find the user by id
      user,
      { new: true } // updated data
    );

    const updatedUser = await getUserWithUnitsMembers(userUpdated._id);

    return res.status(200).json({
      updatedUser,
      message: 'Updated successfully!',
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);

    res.status(500).json({
      success: false,
      message: 'Unable to reset user password',
    });
    console.log(error);
  }
};
