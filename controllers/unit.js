const Unit = require('../models/unit');

exports.getUnits = async (req, res, next) => {
    try {
        const units = await Unit.find();
        return res.status(200).json(units);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.addUnit = async (req, res, next) => {
    try {
        const { name, departmentId } = req.body;

        const unit = new Unit({
            name,
            departmentId,
        });

        await unit.save();
        return res.status(200).json({
            message: 'Unit added successfully!',
            unit,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.updateUnit = async (req, res, next) => {
    const { id } = req.params;
    const unitData = req.body;

    Unit.findByIdAndUpdate(id, unitData, { new: true })
        .then((updatedUnit) => {
            if (updatedUnit) {
                return res.status(200).json({
                    updatedUnit,
                    message: 'Unit updated successfully!',
                });
            } else {
                return res.status(404).json({
                    message: 'Unit not found!',
                });
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ message: error.message });
        });
};

exports.deleteUnit = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedUnit = await Unit.findOneAndDelete({
            _id: id,
        });
        if (!deletedUnit) {
            return res.status(404).json({ error: 'Unit not found' });
        }
        return res.status(200).json({ message: 'Unit deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
