const cloudinary = require('cloudinary').v2;
import { put } from "@vercel/blob";


// Configuration 

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
  secure: true,
});


// Upload
interface props {
  publicId?: string,
  data: string
}
export const uploadImage = async ({publicId="on8x0w6l", data}: props) => {

  // Use the uploaded file's name as the asset's public ID and 
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    publicId
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(data, options);
    //console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};


/* const res = cloudinary.uploader.upload('https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg', {public_id: "olympic_flag"})

res.then((data: any) => {
  console.log(data);
  console.log(data.secure_url);
}).catch((err: any) => {
  console.log(err);
}); */


// Generate 
export const getAssetInfo = async (publicId: string) => {

  // Return colors in the response
  const options = {
    colors: true,
  };

  try {
      // Get details about the asset
      const result = await cloudinary.api.resource(publicId, options);
      //console.log(result);
      return result.colors;
      } catch (error) {
      console.error(error);
  }
};

export const uploadToVercel = async (filename: string, file: any) =>{
 
  const blob = await put(filename, file, {
    access: 'public',
  });
 
  return blob
}




// The output url
// console.log(url);
// https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag