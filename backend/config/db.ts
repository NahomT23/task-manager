import mongoose from 'mongoose';
import { configDotenv } from 'dotenv'; 
configDotenv();


const mongoURI = process.env.MONGO_URI;

const connectToDB = async () => {
    if (!mongoURI) {
        console.error('MONGO_URI is not defined in environment variables');
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

export default connectToDB;
