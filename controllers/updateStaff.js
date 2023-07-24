import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import ReplaceStatus from "../models/replacepage.js";
import watermark from '../models/watermark.js'
import fsx from 'fs-extra';
import { Console } from "console";

const key = "6492802eb312980350eae3cf:fb5fb378053efe19fd0b06e551cca071d3331b8d2f7cb638b5645c7c96c63e5f";

let token = generateToken();

function generateToken() {
	const [id, secret] = key.split(":");
	const expiresInMinutes = 60; 

	return jwt.sign({}, Buffer.from(secret, "hex"), {
		keyid: id,
		algorithm: "HS256",
		expiresIn: expiresInMinutes * 60, 
		audience: "/admin/",
	});
}



let imagePath = "";
export const updateStaff = async (req, res, next) => {
	if (!req.generate) {
		res.status(200).json({ message: "Webhook request received and processed successfully." });
	}
	console.log("Update Start", req);


}