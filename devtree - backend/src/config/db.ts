import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const { connection } = await mongoose.connect(process.env.MONGO_URI)
        const url = `${connection.host}:${connection.port}`
        console.log(`mongoDB Conecetado em ${url}`)
    }
    catch(error){
        console.log(error)
    } 
}