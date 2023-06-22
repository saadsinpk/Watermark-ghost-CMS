import mongoose from "mongoose";
import test from "../models/test.js";
import nodemailer from 'nodemailer';



export const menber = async (req, res, next) => {
    // console.log(req.body);
    try {
        const detail = new test({ ...req.body });
        await detail.save();
        res.status(200).send("detail has been created!!")
    } catch (err) {
        next(err)
    }
}

export const nodemailer1 = async (req, res) => {
    res.send(req.body)
    let testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'admin@oemdieselparts.com',
            pass: 'ggdkqhgufudcgkpm'
        }
    });
    let info = await transporter.sendMail({
        from: '"Password 👻" <admin@oemdieselparts.com>', // sender address
        to: "anasirfa577@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "ye ap ka password hai", // plain text body
        html: "<b>ye ap ka password hai</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);

    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    
   