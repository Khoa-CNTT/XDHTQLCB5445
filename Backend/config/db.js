import mongoose from "mongoose";
export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://dcthang489:thang123@cluster0.k9jbh.mongodb.net/Final').then(() => console.log("DB connected"));
    //await mongoose.connect('mongodb+srv://tranvantin2009:kltt42@kltt42.erl2l.mongodb.net/KLTT_42').then(() => console.log("DB connected"));
}   