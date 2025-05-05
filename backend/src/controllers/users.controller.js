import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";


export const signup =async (req,res) =>{
    const{fullName,email,password} =req.body;
    try {
        if( !fullName || !email || !password){
            return res.status(400).json({message:"All fields are requierd"});
        }
        if(password.length<8){
            return res.status(400).json({message:"passsword must be atleast 8 characters"});
        }

        const user = await User.findOne({email});
        if(user) return res.status(400).json({message:"Email already in use"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword =await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        });

        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
            });
        }
        else{
            req.status(400).json({message :"Invalid user data"});
        }
    } catch (error) {
       console.log("Error while signing up",error.message);
       res.status(500).json({message:"internal server error"})
        
    }
}

export const checkAuth = async(req,res) =>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error while checking auth",error.message);
        res.status(500).json({message:"internal server error"});
    }
}

export const logout = async(req,res) =>{
    try {
        res.cookie("jwt","", {maxAge:0})
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message:"Internal server error"});
    }
}