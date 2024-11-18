const Role = require('../models/role');

exports.getRoles = async (req, res, next) => {
    try {
        const roles = await Role.find();
        return res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.addRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;

        const role = new Role({
            name,
            description,
            permissions,
        });

        await role.save();
        return res.status(200).json({
            message: 'Role added successfully!',
            role,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.updateRole = async (req, res, next) => {
    const { id } = req.params;
    const roleData = req.body;

    Role.findByIdAndUpdate(id, roleData, { new: true })
        .then((updatedRole) => {
            if (updatedRole) {
                return res.status(200).json({
                    updatedRole,
                    message: 'Role updated successfully!',
                });
            } else {
                return res.status(404).json({
                    message: 'Role not found!',
                });
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ message: error.message });
        });
};

exports.deleteRole = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedRole = await Role.findOneAndDelete({ _id: id });
        if (!deletedRole) {
            return res.status(404).json({ error: 'Role not found' });
        }
        return res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
