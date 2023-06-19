import mongoose from "mongoose";


const registrationSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})

// Create the Registration model
export default  mongoose.model('Registration', registrationSchema);
