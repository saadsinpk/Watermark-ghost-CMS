import mongoose from "mongoose";
import createError from 'http-errors';
import postCreate from "../models/Post.js";



export const Delete12 = async (req, res, next) => {

console.log(req.body.id);
      try {
        const postId = req.body.post.previous.id;
      
        await postCreate.deleteOne({ "post.current.id": postId });
        res.status(204).send("success"); 
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete the post' });
      }

}

