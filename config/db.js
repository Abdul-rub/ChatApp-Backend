const mongoose = require("mongoose")

const connectDB = async()=>{
    try {
    const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${connection.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold)
        process.exit()
        
    }
}

module.exports= connectDB