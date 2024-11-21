const fetch = require("node-fetch");
const md5 = require("crypto-js/md5");
const fs = require("fs");
const path = require("path");

// Function to fetch Gravatar image as a Blob
const getGravatarBlob = async (email, size = 200) => {
  const hash = md5(email.trim().toLowerCase()).toString();
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;

  try {
    const response = await fetch(gravatarUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch Gravatar: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error fetching Gravatar Blob:", error);
    throw error;
  }
};

// Save Blob to server file system
const saveImageBlob = (buffer, fileName) => {
  const filePath = path.join("images", fileName);
  fs.writeFileSync(filePath, buffer);
  return `/${filePath}`; // Return the relative path
};

module.exports = { getGravatarBlob, saveImageBlob };
