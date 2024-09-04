import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connctionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\nConnected to MONGODB ${connctionInstance.connection.host}`)
    } catch (error) {
        console.error("MPNGODB connection FAILED: ", error)
        process.exit(1)
    }
}

export default connectDB