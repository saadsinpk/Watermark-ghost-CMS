import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import postCreate from "../models/Post.js";
import Imagemain from "../models/ImageSchema.js";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import ReplaceStatus from "../models/replacepage.js";
import watermark from '../models/watermark.js'
import { Console } from "console";
import fsx from 'fs-extra';

cloudinary.config({
	cloud_name: "dpuampgi2",
	api_key: "737194746156619",
	api_secret: "76PFeFR5akqA53UcFDiNRDGbp1A",
});
const key =
	"0669cbbf4862dc38cf9fe69710:6492802eb312980350eae3cf:fb5fb378053efe19fd0b06e551cca071d3331b8d2f7cb638b5645c7c96c63e5f";

const [id, secret] = key.split(":");

const token = jwt.sign({}, Buffer.from(secret, "hex"), {
	keyid: id,
	algorithm: "HS256",
	expiresIn: "10y",
	audience: "/admin/",
});


export const Update = async (req, res, next) => {
	return new Promise((resolve, reject) => {
		try {
			// console.log(req.body.post);
			async function deleteDirectory(dirPath) {
				try {
					await fsx.remove(dirPath);
					console.log(`Directory '${dirPath}' deleted successfully.`);
				} catch (err) {
					console.log(`An error occurred while deleting directory '${dirPath}': ${err.message}`);
				}
			}

			function deleteFile(path) {
				fs.unlink(path, (err) => {
					if (err) {
						if (err.code === 'ENOENT') {
							console.log(`File '${path}' not found.`);
						} else {
							console.log(`An error occurred while deleting file '${path}': ${err.message}`);
						}
					} else {
						console.log(`File '${path}' deleted successfully.`);
					}
				});
			}



			if (req.body.post != undefined) {
				const postId = req.body.post.current.id;
				obj.id = postId;
				let updatedData = req.body;


				let imageUrl2;
				const updatedCards = [];
				const updatedCards_define = [];
				const updatedCards_index = [];
				const updatedCards_gallery_index = [];
				let isFetchingComplete = false;
				let mobiledoc;
				let currentDate = req.body.post.current.updated_at;
				let currentTitle = req.body.post.current.title;
				if (req.body.post.current.mobiledoc) {
					mobiledoc = JSON.parse(req.body.post.current.mobiledoc);

					let cards = mobiledoc.cards;

					if (cards) {
						let count_image = 0
						let count_gallery = 0
						let count_card_image = 0
						for (const card of mobiledoc.cards) {
							if (card[0] === "image") {
								const imageUrl = card[1].src;
								updatedCards.push(imageUrl);
								updatedCards_define.push("Card");
								updatedCards_index.push(count_card_image++);
								updatedCards_gallery_index.push(count_gallery++);
							} else {
								if (card[0] === "gallery") {
									const images1 = card[1].images;
									let count_gallery_image = 0
									let temp_count = count_gallery++
									for (const image of images1) {
										const imageUrl = image.src;
										updatedCards.push(imageUrl);
										updatedCards_define.push("gallery");
										updatedCards_index.push(count_gallery_image++);
										updatedCards_gallery_index.push(temp_count);
									}
								}
							}
						}
					}

					updatedCards.push(req.body.post.current.feature_image);
					updatedCards_define.push("Feature");
					let currentDate;
					let currentTitle;
					let payload;
					let featureImage = '';
					const mobiledoc_updated = JSON.parse(req.body.post.current.mobiledoc);


					const watermarkchange = await watermark.findOne({ "id": "648ab1684855601a64bcdf5d" });


					async function addWatermarkToImage(imageUrl, mongoreplace, oldwatermark_img = null) {

						const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
						const imageBuffer = Buffer.from(response.data, "binary");
						const imageFolderPath = "./public";
						const imageFilename = `image_${Date.now()}.png`;
						const svgPath = path.join(imageFolderPath, "image.png");
						const pngPath = path.join(imageFolderPath, imageFilename);

						if (fs.existsSync(svgPath)) {
							fs.unlinkSync(svgPath);
						}

						const textWatermark = watermarkchange.watermark;
						const watermarkColor = "rgba(255, 255, 255, 0.5)";

						const image = await sharp(imageBuffer);
						const metadata = await image.metadata();
						const watermarkWidth = metadata.width;
						const watermarkHeight = metadata.height;

						const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
		                                <text x="${watermarkWidth / 2}" y="${watermarkHeight / 2}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
		                              </svg>`;

						const watermark = await sharp(Buffer.from(watermarkSvg)).png().toBuffer();

						let filePath = "";
						let filePath1 = "";
						let filePath2 = "";
						let filePath3 = "";
						let filePath4 = "";

						let date = Date.now();
						const subDirectory1 = `watermarked_${date}.pngcontent/images/size`; // Specify the subdirectory you want to create
						const subDirectoryPath1 = path.join(imageFolderPath, subDirectory1);
						await fs.promises.mkdir(subDirectoryPath1, { recursive: true });


						filePath = path.join(imageFolderPath, `watermarked_${date}.png`);
						filePath1 = path.join(subDirectoryPath1, `w300`);
						filePath2 = path.join(subDirectoryPath1, `w600`);
						filePath3 = path.join(subDirectoryPath1, `w1000`);
						filePath4 = path.join(subDirectoryPath1, `w2000`);

						await image.composite([{ input: watermark }]).toFile(filePath);
						await image.composite([{ input: watermark }]).toFile(filePath1);
						await image.composite([{ input: watermark }]).toFile(filePath2);
						await image.composite([{ input: watermark }]).toFile(filePath3);
						await image.composite([{ input: watermark }]).toFile(filePath4);

						if (mongoreplace == true) {
							const pathArray = oldwatermark_img.split("/");
							const deleteimg_name = pathArray[pathArray.length - 1];

							// Example usage:
							const delete_directoryPath = './public/' + deleteimg_name + 'content';
							deleteDirectory(delete_directoryPath);

							const delete_filePath = './public/' + deleteimg_name;
							deleteFile(delete_filePath);

							const change = await ReplaceStatus.findOne({
								$or: [
									{ feature_imageold: imageUrl }
								],
							});
							// const change = await ReplaceStatus.findOne({ id: postId });
							change.feature_image = `https://oemdieselparts.com/pic/${path.basename(filePath)}`;
							change.Watermark = watermarkchange.watermark;
							await change.save();
							return filePath;
						} else {
							const ReplaceStatussave = new ReplaceStatus({
								id: postId,
								feature_imageold: imageUrl,
								feature_image: `https://oemdieselparts.com/pic/${path.basename(filePath)}`,
								hasWatermark: true,
								Watermark: watermarkchange.watermark,
								DocumentType: "post",
							});
							await ReplaceStatussave.save();
							return filePath;
						}
					}

					const watermarkPromises = [];

					let mongoID;
					let mongoID1;
					for (let i = 0; i < updatedCards.length; i++) {
						const mongoID1 = await ReplaceStatus.findOne({
							$or: [
								{ feature_image: updatedCards[i] }
							],
						});
						const mongoID = await ReplaceStatus.findOne({
							$or: [
								{ feature_imageold: updatedCards[i] },
								{ feature_image: updatedCards[i] },
							],
						});

						if (!mongoID1) {

							console.log("tessst3");
							console.log(mongoID.feature_imageold);
							const watermarkPromise = addWatermarkToImage(mongoID.feature_imageold, true, updatedCards[i])
								.then((watermarkedImagePath) => {

									const watermarkedImagePath_pathArray = watermarkedImagePath.split("/");
									const watermarkedImagePath_final = watermarkedImagePath_pathArray[watermarkedImagePath_pathArray.length - 1];

									currentDate = req.body.post.current.updated_at;
									currentTitle = req.body.post.current.title;

									if (updatedCards_define[i] === 'Feature') {
										featureImage = `https://oemdieselparts.com/pic/${watermarkedImagePath_final}`;
									} else if (updatedCards_define[i] === 'Card') {
										const cards = mobiledoc_updated.cards;
										if (cards) {
											for (const [index, card] of cards.entries()) {
												if (card[0] === 'image' && card[1].src === updatedCards[i]) {
													mobiledoc_updated.cards[updatedCards_gallery_index[i]][1].src = `https://oemdieselparts.com/pic/${watermarkedImagePath_final}`;
												}
											}
										}
									} else {
										if (req.body.post.current.mobiledoc) {
											const cards = mobiledoc_updated.cards;
											if (cards) {
												for (const [index, card] of cards.entries()) {
													mobiledoc_updated.cards[updatedCards_gallery_index[i]][1].images[updatedCards_index[i]].src = `https://oemdieselparts.com/pic/${watermarkedImagePath_final}`;
												}
											}
										}
									}

								})
								.catch((error) => {
									console.error("Error adding watermark to image:", error.response.statusText);
								});
							watermarkPromises.push(watermarkPromise);
						}

					}

					if (watermarkPromises.length > 0) {
						Promise.all(watermarkPromises)
							.then(() => {
								const url = `https://oemdieselparts.com/ghost/api/admin/posts/${postId}`;
								const headers = {
									Authorization: `Ghost ${token}`,
								};
								currentDate = req.body.post.current.updated_at;
								currentTitle = req.body.post.current.title;
								if (featureImage != '') {
									payload = {
										posts: [
											{
												id: `${postId}`,
												updated_at: currentDate,
												title: currentTitle,
												feature_image: featureImage,
												mobiledoc: JSON.stringify(mobiledoc_updated)
											}
										]
									};
								} else {
									payload = {
										posts: [
											{
												id: `${postId}`,
												updated_at: currentDate,
												title: currentTitle,
												mobiledoc: JSON.stringify(mobiledoc_updated)
											}
										]
									};
								}
								console.log(req.body.post.current.id)
								if (payload != '' && typeof payload !== 'undefined') {
									const checkFields = async () => {
										try {
											const response = await axios.put(url, payload, { headers });
											console.log('Feature SUCCESS');
											return
										} catch (error) {
											console.error('ERR', error.response);
											isFetchingComplete = true;
										}
									};
									checkFields();
								}
							})
							.catch((error) => {
								console.error("Error adding watermark to images:", error.response.statusText);
							});
					        resolve();
					} else {
				        resolve();
					}
				};
			}
			if (!req.generate) {
				console.log("Post Update webhook hit");
				res.status(200).json({ message: "Webhook request received and processed successfully." });
			}
		} catch (error) {
	        resolve();
			// Handle any errors that occurred during webhook processing
			console.error(error);

			// Send an error response
			res.status(500).json({ message: "An error occurred while processing the webhook." });
		}
    });
}