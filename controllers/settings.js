const Settings = require('../models/settings');
const fs = require('fs');
const path = require('path');

exports.updateLogo = async (req, res, next) => {
  try {
    const logoFileName = req.files.logo[0].filename;
    const logoUrl = '/logo/' + logoFileName;
    const logoFolderPath = path.join(__dirname, '../logo');

    // Check if there is an existing logo in the database
    let settings = await Settings.findOne();
    if (!settings) {
      // If no settings exist, create a new one with the logo URL
      settings = new Settings({ logo: logoUrl });
    } else {
      // Save the current logo to the logo folder
      const currentLogoPath = path.join(logoFolderPath, logoFileName);
      const destinationPath = path.join(logoFolderPath, logoFileName);

      // Copy the current logo to the logo folder
      fs.copyFileSync(currentLogoPath, destinationPath);

      // Delete all files in the logo folder except the current logo
      fs.readdir(logoFolderPath, (err, files) => {
        if (err) {
          console.error('Error reading logo folder:', err);
        } else {
          files.forEach((file) => {
            if (file !== logoFileName) {
              const filePath = path.join(logoFolderPath, file);
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted successfully:', filePath);
                }
              });
            }
          });
        }
      });

      // Update the logo URL
      settings.logo = logoUrl;
    }

    // Save the updated settings
    const updatedSettings = await settings.save();

    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getLogo = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const logo = settings.logo;
    console.log(logo);
    return res.status(200).json(logo);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
