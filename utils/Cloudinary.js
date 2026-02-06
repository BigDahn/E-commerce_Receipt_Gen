const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

async function uploadReceipt(filePath, receiptNumber) {
  // console.log(filePath);
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "receipts",
    public_id: receiptNumber,
  });

  return result;
}

module.exports = uploadReceipt;
