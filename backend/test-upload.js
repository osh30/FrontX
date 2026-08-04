require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadTest = () => {
  return new Promise((resolve, reject) => {
    let options = {
      resource_type: 'raw',
      folder: 'frontx/test',
      public_id: 'test_file_txt_' + Date.now() + '.txt'
    };

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const buffer = Buffer.from('hello world text');
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

uploadTest().then(result => {
    console.log(result.secure_url);
}).catch(console.error);
