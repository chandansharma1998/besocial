import UserModal from "../Models/UserModal.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


//type:GET
//Get all users
export const getAllUsers = async(req, res) =>{
    try {
        let users = await UserModal.find()
        users= users.map(user => {
            const {password, ...other} = user._doc
            return other
        })
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}


//Type:GET
//Get single user
export const getUser = async(req,res) =>{
    const id=req.params.id;

    try {
        const user = await UserModal.findById(id);

        if(user){
            const {password, ...otherDetails} = user._doc;
            res.status(200).json({message:"Success",otherDetails});
        }
        else{
            res.status(404).json({message:`No user with id:${id}`})
        }
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

//Type:PUT
//update user
export const updateUser = async(req,res) =>{
    //id is the id of user which will be updated
    const id=req.params.id;

    //_id is the id of the user which is making changes to the user with id:id
    const {_id, password} = req.body;

    //if user is updating its own details or admin is updating the details of that user
    if(_id===id ){
        try {
            if(password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password,salt);
            }

            const user = await UserModal.findByIdAndUpdate(id,req.body,{new:true});
            //the new:true will return updated user 

            res.status(200).json({message:"Details updated",user})
            
        } catch (err) {
            res.status(500).json({message:err.message})
        }
    }
    else{
        res.status(403).json({message:"Access Denied! You can only update your own profile"})
    }
}

//Type:DELETE
//Delete a user
export const deleteUser = async(req,res)=>{
    const id = req.params.id;

    const {currUserId, isUserAdmin} = req.body
    if(id===currUserId || isUserAdmin){
        try {
            await UserModal.findByIdAndDelete(id);
            res.status(200).json({message:"User deleted Successfully"})
        } catch (err) {
            res.status(500).json({message:err.message})
        }
    }
    else{
        res.status(403).json({message:"Access Denied! You can only update your own profile"})
    }
}

//Type:PUT
//follow a user
export const followUser = async(req,res) => {
    //id of user who is followed
    const id = req.params.id;

    //user with id:currUserId follows user with id:id
    const {_id} = req.body

    if(id===_id){
        //user cannot follow itself
        res.status(403).json({message:"User cannot follow itself"})
    }
    else{
        //add user with id:_id to the followers array of user with id:id
        //add user with id:id to the following array of user with id:_id
        try {
            const followUser = await UserModal.findById(id)
            const followingUser = await UserModal.findById(_id)

            if(!followUser.followers.includes(_id)){
                await followUser.updateOne({$push:{followers:_id}})
                await followingUser.updateOne({$push:{followings:id}})

                res.status(200).json({message:`You have followed user ${followUser.username}`})
            }
            else{
                res.status(403).json({message:`You already follow this user:${followUser.username}`})
            }
        } catch (err) {
            res.status(500).json({message:err.message})
        }
    }

}

//Type:PUT
//unfollow a user
export const unfollowUser = async(req,res) => {
    //id of user who is unfollowed
    const id = req.params.id;

    //user with id:_id unfollows user with id:id
    const {_id} = req.body

    if(id===_id){
        //user cannot unfollow itself
        res.status(403).json({message:"User cannot unfollow itself"})
    }
    else{
        //remove user with id:_id from the followers array of user with id:id
        //remove user with id:id from the following array of user with id:_id
        try {
            const followUser = await UserModal.findById(id)
            const followingUser = await UserModal.findById(_id)

            if(followUser.followers.includes(_id)){
                await followUser.updateOne({$pull:{followers:_id}})
                await followingUser.updateOne({$pull:{followings:id}})

                res.status(200).json({message:`You have unfollowed user ${followUser.username}`})
            }
            else{
                res.status(403).json({message:`You do not follow this user:${followUser.username}`})
            }
        } catch (err) {
            res.status(500).json({message:err.message})
        }
    }
}