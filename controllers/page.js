import mongoose from "mongoose";
import createError from 'http-errors';
import Page from "../models/Page.js";


export const page12 = async (req, res, next) => {
    try {
        const Page1 = new Page({ ...req.body });
        await Page1.save();
        res.status(200).send("page has been created!!")
        console.log("create");
    } catch (err) {
        next(err)
        console.log(err);
    }
}

