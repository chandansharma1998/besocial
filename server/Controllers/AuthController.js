import UserModal from "../Models/UserModal.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const registerUser = async(req,res) =>{

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password,salt);
    req.body.password = hashedPass
    
    try {
        const userAlreadyExists = await UserModal.findOne({username:req.body.username})
        if(userAlreadyExists){
            res.status(403).json({message:"User already exists"})
        }
        else{

            //creates a new user instance
            const newUser = new UserModal(req.body)
            //now we need to save this user to db
            const user = await newUser.save();
            const token = jwt.sign({username:user.username, id:user._id}, "SECRET_KEY", {expiresIn:'4h'})
            res.status(200).json({user,token})
        }
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const loginUser = async(req,res)=>{
    const {username,password} = req.body;

    try {
        //Check the user is present or not with this username
        const user = await UserModal.findOne({username:username});
        if(user){
            //validate password
            const isPasswordValid = await bcrypt.compare(password,user.password);
    
            if(isPasswordValid){
                const token = jwt.sign({username:user.username, id:user._id}, "SECRET_KEY", {expiresIn:'4h'})
                res.status(200).json({message:"Login Successful", user, token});
            }
            else{
                res.status(400).json({message:"Incorrect Password"});
            }
        }
        else{
            res.status(400).json({message:"User not registered"});
        }
        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}