const User = require('../models/user');
const Role = require("../models/role");
const File = require("../models/document");




async function checkFileOwnerShip(req, res, next) {
    if (req.isAdmin || req.teamLead) {
        return next();
    }

    const fileId = req.params.id;
    const file = await File.findById(fileId);
    if (!file) {
        return res.status(404).send('File not found');
    }

    if (!file.classification) {
        return next();
    }
    const user = await User.findById(req.auth.userId);
    if (!user) {
        return res.status(404).send('User not found');
    }
    if (file.createdBy === user.displayName) {
        return next();
    } else {
        if (file.users.length === 0) {
            return res.status(403).send('Access denied');
        }
        file.users.forEach((userId) => {
            if (userId === req.auth.userId) {
                return next();
            }
        });
    }
}

function checkPermissions(requiredPermissions) {
    return async function (req, res, next) {
        const user = await User.findById(req.auth.userId);
        console.log('user: ', user);
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
            });
        }
        if (!user.roleId) {
            return res.status(403).json({
                message: 'Access denied.',
            });
        }

        const role = await Role.findById(user.roleId);
        if (!role) {
            return res.status(404).json({
                message: 'Role not found.',
            });
        }
        if (role.permissions.length === 0) {
            return res.status(403).send('Access denied.');
        }

        if (role.name === 'Admin') {
            req.isAdmin = true;
            return next();
        }

        const hasPermission = role.permissions.some((permission) =>
            requiredPermissions.includes(permission)
        );

        if (hasPermission && role.name === 'Team Lead') {
            req.teamLead = true;
            return next();
        } else if (hasPermission) {
            return next();
        } else {
            return res.status(403).send('Access denied.');
        }
    };
}

module.exports = {
  checkPermissions,
  checkFileOwnerShip,
};
