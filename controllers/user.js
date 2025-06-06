import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import createError from 'http-errors';



export const signUp = async (req, res, next) => {
    // console.log(req.body);
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser = new User({ ...req.body, password: hash });


        await newUser.save();
        res.status(200).send("user has been created!!")
    } catch (err) {
        next(err)
    }
}


export const signin = async (req, res, next) => {
    // console.log(req.body);
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return next(createError(404, "User not found!"));

        const isCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isCorrect) return next(createError(400, "Wrong Credentials!"));

        const token  = jwt.sign({id:user._id}, process.env.JWT)
        res.cookie("access_token", token,{
            httpOnly:true
        }).status(200).json(user)
    } catch (err) {
        next(err)
    }
}