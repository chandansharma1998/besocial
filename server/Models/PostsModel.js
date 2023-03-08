import mongoose from "mongoose";

const PostsModel = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    desc:{
        type:String
    },
    likes:Array,
    image:String,
    comments:Array
},{timestamps:true})

export default mongoose.model("Posts",PostsModel)