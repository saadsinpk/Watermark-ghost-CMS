import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import ReplaceStatus from "../models/replacepage.js";
import watermark from '../models/watermark.js'
import fsx from 'fs-extra';
import { Console } from "console";
import { createCanvas } from 'canvas';

export const Allimage = async (req, res, next) => {
  try {
	const watermarkchange = await watermark.findOne({ "id": "648ab1684855601a64bcdf5d" });

    const id = req.params.id;
    const segment1 = req.params.segment1;
    let segment2 = req.params.segment2;
    let img_url;
    if(req.params.segment3 && req.params.segment4 && req.params.segment5) {
    	segment2 = segment2.replace('content', "");
	    img_url = "https://oemdieselparts.com/content/images/"+id+"/"+segment1+"/"+segment2;
    } else {
	    img_url = "https://oemdieselparts.com/content/images/"+id+"/"+segment1+"/"+segment2;
    }



	await axios.head(img_url);

	const response = await axios.get(img_url, { responseType: "arraybuffer" });
	const imageBuffer = Buffer.from(response.data, "binary");
	const image = await sharp(imageBuffer);

	if (watermarkchange.watermarktype === "image") {

		const metadata = await image.metadata();
		const watermarkWidth = metadata.width;
		const watermarkHeight = metadata.height;

		const watermarkImagePath = watermarkchange.imagewatermark;

		const watermarkResponse = await axios.get(watermarkImagePath, { responseType: "arraybuffer" });
		const watermarkBuffer = Buffer.from(watermarkResponse.data, "binary");

		const watermarkImage = await sharp(watermarkBuffer)
			.resize(watermarkWidth, watermarkHeight, { fit: 'inside' })
			.ensureAlpha()
			.toBuffer();

		const watermarkedImageBuffer = await image
			.clone()
			.composite([{ input: watermarkImage }])
			.toBuffer();


		res.setHeader("Content-Type", "image/png");
     	res.send(watermarkedImageBuffer);
	} else {
		const textWatermark = watermarkchange.watermark;
		const watermarkColor = "rgba(255, 255, 255, 0.5)";

		const metadata = await image.metadata();
		const watermarkWidth = metadata.width;
		const watermarkHeight = metadata.height;
		const angleInRadians = (watermarkchange.deg || 0) * Math.PI / 180;

		let centerX, centerY;
		let fontSize = Math.min(watermarkWidth, watermarkHeight) * 0.5; // Adjust the factor as needed

		const tempFontSize = (watermarkWidth * 0.8) / textWatermark.length;
		fontSize = Math.min(fontSize, tempFontSize);

		centerX = watermarkWidth / 2;
		centerY = watermarkHeight / 2 + (fontSize / 2);

		// Create a canvas to generate the text watermark
		const canvas = createCanvas(watermarkWidth, watermarkHeight);
		const context = canvas.getContext('2d');
		context.fillStyle = watermarkColor;
		context.font = `${fontSize}px Arial`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// Rotate the context
		context.translate(centerX, centerY);
		context.rotate(angleInRadians);
		context.translate(-centerX, -centerY);

		context.fillText(textWatermark, centerX, centerY);

		// Convert the canvas to a buffer
		const watermarkBuffer = canvas.toBuffer();

		const watermarkImage = await sharp(watermarkBuffer)
		  .ensureAlpha()
		  .toBuffer();

		const watermarkedImageBuffer = await image
		  .clone()
		  .composite([{ input: watermarkImage }])
		  .jpeg({ quality: 80 })
		  .toBuffer();

		// Send the watermarked image buffer as the response
		res.setHeader("Content-Type", "image/jpeg");
		res.send(watermarkedImageBuffer);

	}

  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};