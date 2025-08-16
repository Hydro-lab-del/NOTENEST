import mongoose from "mongoose";


 const connectdb = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`) ;
    console.log(`MongoDB connected host : ${connectionInstance.connection.host}`)  
    } catch (error) {
        console.error("Monogdb connection failed:", error);
        process.exit(1);
    }
    
}

export default connectdb;