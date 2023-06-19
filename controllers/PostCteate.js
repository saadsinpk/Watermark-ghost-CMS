import mongoose from "mongoose";
import createError from 'http-errors';
import postCreate from "../models/Post.js";



export const Create1 = async (req, res, next) => {
    // console.log(req.body);
    try {
        let image = req.body
        console.log(image, "image");
        const post = new postCreate({ ...req.body });
        await post.save();
        res.status(200).send("post has been created!!")
        console.log("create");
    } catch (err) {
        next(err)
        console.log(err);
    }
}

