import mongoose from "mongoose";
import PostsModel from "../Models/PostsModel.js";
import UserModel from '../Models/UserModal.js';

//Type:POST
//Create a post
export const createPost = async(req,res) => {
    const {userId} = req.body
    
    try {
        const user = await UserModel.findOne({_id:userId})
        req.body.firstname = user.firstname
        req.body.lastname = user.lastname
        const newPost = new PostsModel(req.body);
        const post = await newPost.save();
        res.status(200).json({message:"Post created",post})
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

//type:GET
//Read a post
export const getPost = async(req,res) => {
    const id=req.params.id;
    try {
        const post = await PostsModel.findById(id)
        if(post){
            res.status(200).json(post)
        }
        else{
            res.status(404).json({message:`No post with id:${id}`})
        }
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

//type:PUT
//update a post
export const updatePost = async(req,res) =>{
    //id of the post to be updated
    const id = req.params.id;

    //id of the user updating the post
    const {userId} = req.body

    //we allow user to update only if its his post
    try {
        const post = await PostsModel.findById(id);
        if(post){
            if(userId === post.userId){
                //since we already have the post so we will not use findByIdAndUpdate 
               // const updatedPost = await PostsModel.findByIdAndUpdate(id, req.body, {new:true})
                await post.updateOne({$set:req.body})
                res.status(200).json({message:"Post updated successfully"})
            }
            else{
                res.status(403).json({message:"Not authorized to update this post"})
            }
        }
        else{
            res.status(404).json({message:`No post with id:${id}`})
        }
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

//type:DELETE
//delete a post
export const deletePost = async(req,res) => {
    const id = req.params.id
    const {userId} = req.body

    try {
        const post = await PostsModel.findById(id);
        if(post.userId === userId){
            await post.deleteOne();
            res.status(200).json({message:"Post deleted successfully"})
        }
        else{
            res.status(403).json({message:"Not authorized to delete this post"})
        }
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

//Type:PUT
//Like/Unlike a post
export const likeUnlikePost = async(req,res) => {
    //id of the post that we want to like
    const id = req.params.id

    //id of user who likes/unlikes the post with id:id 
    const {userId} = req.body;

    try {
        const post = await PostsModel.findById(id)
        if(!post.likes.includes(userId)){
            //means user hasnt already liked this post
            //so include it in likes array of the post
            await post.updateOne({$push:{likes:userId}})
            res.status(200).json({message:"Post liked"})
        }
        else{
            //post is already liked by the user so unlike it
            await post.updateOne({$pull:{likes:userId}})
            res.status(200).json({message:"Post unliked"})
        }
    } catch (err) {
         res.status(500).json({error:err.message})
    }
}

//Type:GET
//get all timeline posts of the user
export const getTimelinePosts = async(req,res) => {
    //id of the user whose timeline posts need to fetch
    //it will include his posts as well as his followings posts
    const userId = req.params.id

    try {
        //fetch all posts of this user 
        const userPosts = await PostsModel.find({userId:userId})

        //fetch all user posts whom this user with id:id follows
        //we use aggregate query on User model for this. 
        //aggregate is array of stages
        const followingsPosts = await UserModel.aggregate([
            //stage-1
            //match/filter the user from the user collection
            {
                $match:{
                    //this matches the userId with _id in User collection in format ObjectId('userId')
                    //Here it returns single document
                    _id:new mongoose.Types.ObjectId(userId)
                }
            },
            //stage-2
            {
                //lookup performs left join with another collection("posts"(from)).
                //From the user that we have matched in stage-1, we need to access his "followings"(localField) array
                //and match all the id present there with "userId"(foreignField) of posts collection and fetch all those 
                //matched posts as followingPosts
                $lookup:{
                    from:"posts",
                    localField:"followings",
                    foreignField:"userId",
                    as:"followingsPosts"
                }
            },
            //stage-3
            {
                //decide what fields we want to return. By default it returns _id with matched fields
                //we discard _id
                $project:{
                    followingsPosts:1,
                    _id:0
                }
            }
        ])
        const allPosts = userPosts.concat(...followingsPosts[0].followingsPosts)
        allPosts.sort((a,b)=>{
            return b.createdAt - a.createdAt;
        })
        res.status(200).json(allPosts)
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}