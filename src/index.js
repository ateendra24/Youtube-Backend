import { server } from './app.js'; // Your Express app
import connectDB from './db/index.js'; // Database connection
import dotenv from 'dotenv'

dotenv.config({
    path: './env'
})

// Connect to the database and start the server
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MONGODB connection FAILED.", err);
    });
