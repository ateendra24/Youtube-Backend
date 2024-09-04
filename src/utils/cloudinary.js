import { v2 as cloudinary} from "cloudinary";
import fs from 'fs'

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath){
            return null
        }
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        // file has been uploaded successfully
        // console.log("file has been uploaded successfully on Cloudinary",response.url)
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as upload failed

        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as upload failed
        return null;
    }
}

const deleteFromCloudinary = async (fileId, resourceType) => {
    try {
        // Function to extract publicId from fileId
        const newfileId = (fileId) => {
            const parts = fileId.split('/');
            const fileNameWithExtension = parts.pop();
            const publicId = fileNameWithExtension.split('.')[0];
            return publicId;
        };

        // Extract publicId
        const publicId = newfileId(fileId);
        console.log("publicId: ", publicId);

        // Delete the asset from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log("response: ", response);

        if (response.result === 'not found') {
            console.log("Cloudinary did not find the asset to delete.");
        } else if (response.result === 'ok') {
            console.log("Cloudinary successfully deleted the asset.");
        }

        return response;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return null;
    }
};




export {uploadOnCloudinary,deleteFromCloudinary}