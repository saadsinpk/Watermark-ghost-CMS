import mongoose from "mongoose";
import createError from 'http-errors';
import Page from "../models/Page.js";



export const pagedelete = async (req, res, next) => {

console.log(req.body.page.previous.id);
// res.send("hello")
      try {
        const postId = req.body.page.previous.id;
      
        await Page.deleteOne({ "page.current.id": postId });
        res.status(204).send("success"); 
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete the post' });
      }

}

