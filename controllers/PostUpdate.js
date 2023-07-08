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
export const Update = async (req, res, next) => {
	if (!req.generate) {
		res.status(200).json({ message: "Webhook request received and processed successfully." });
	}
    let letsfinish = 0;
	const currentTime = new Date();
	console.log("Update Start", currentTime);
    
	if (letsfinish == 0) {
        let currentDate;
		let currentTitle;
		if (req.body.post != undefined) {
            const postId = req.body.post.current.id;

			const updatedCards = [];
			const updatedCards_define = [];
			const updatedCards_index = [];
			const updatedCards_gallery_index = [];
			let mobiledoc;
			currentDate = req.body.post.current.updated_at;
			currentTitle = req.body.post.current.title;
			if (req.body.post.current.mobiledoc) {
				mobiledoc = JSON.parse(req.body.post.current.mobiledoc);

				let cards = mobiledoc.cards;

				if (cards) {
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
				let payload;
				let featureImage = '';
				const mobiledoc_updated = JSON.parse(req.body.post.current.mobiledoc);


				const watermarkchange = await watermark.findOne({ "id": "648ab1684855601a64bcdf5d" });

				function addWatermarkToImage(imageUrl, mongoreplace, oldwatermark_img = null) {
					return new Promise(async (resolve, reject) => {
						try {
							if (mongoreplace == true) {
								const change = await ReplaceStatus.findOne({
									$or: [
										{ feature_imageold: imageUrl }
									],
								});
								change.feature_image = oldwatermark_img.replace('https://oemdieselparts.com/content/images/', 'https://oemdieselparts.com/pic/api/getImage/');
								change.Watermark = watermarkchange.watermark;
								await change.save();
								resolve(imageUrl.replace('https://oemdieselparts.com/content/images/', 'https://oemdieselparts.com/pic/api/getImage/'));
							} else {
								const ReplaceStatussave = new ReplaceStatus({
									id: postId,
									feature_imageold: imageUrl,
									feature_image: imageUrl.replace('https://oemdieselparts.com/content/images/', 'https://oemdieselparts.com/pic/api/getImage/'),
									hasWatermark: true,
									Watermark: watermarkchange.watermark,
									DocumentType: "post",
								});
								await ReplaceStatussave.save();
								resolve(imageUrl.replace('https://oemdieselparts.com/content/images/', 'https://oemdieselparts.com/pic/api/getImage/'));
							}
						} catch (error) {
							if (error.response && error.response.status === 404) {
								resolve();
							} else {
								// Other error - handle it as before
								let errorMessage = "Error with Axios:";
								if (error.response) {
									if (error.response.statusText) {
										errorMessage += error.response.statusText;
									} else {
										errorMessage += JSON.stringify(error.response);
									}
								} else {
									errorMessage += "Unknown error";
								}
								console.error("errorMessage");
								console.error(error);
								reject(error);
							}
						}
					})
				}
				const watermarkPromises = [];

				for (let i = 0; i < updatedCards.length; i++) {
					console.log(updatedCards.length);
					let is_promise = 0;
					let first_img;
					let mongoreplace_boolen;
					let third_img;
					if (updatedCards[i] != null) {
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
						if (mongoID1 && watermarkchange.watermarktype == "image") {
							watermarkchange.watermark = watermarkchange.imagewatermark
							await watermarkchange.save();
						}
						if (!mongoID1) {
							first_img = updatedCards[i];
							mongoreplace_boolen = false;
							third_img = null;
						} else if (mongoID1 && watermarkchange.watermark !== mongoID1.Watermark) {
							first_img = mongoID1.feature_imageold;
							mongoreplace_boolen = true;
							third_img = updatedCards[i];
						} else if (mongoID && watermarkchange.watermark !== mongoID.Watermark) {
							first_img = mongoID.feature_imageold;
							mongoreplace_boolen = true;
							third_img = updatedCards[i];
						}
						if(first_img != undefined) {
							const watermarkPromise = await addWatermarkToImage(first_img, mongoreplace_boolen, third_img)
								.then((watermarkedImagePath) => {
									if (watermarkedImagePath != undefined) {

										if (updatedCards_define[i] === 'Feature') {
											featureImage = watermarkedImagePath;
										} else if (updatedCards_define[i] === 'Card') {
											const cards = mobiledoc_updated.cards;
											if (cards) {
												for (const [index, card] of cards.entries()) {
													if (card[0] === 'image' && card[1].src === updatedCards[i]) {
														mobiledoc_updated.cards[updatedCards_gallery_index[i]][1].src = watermarkedImagePath;
													}
												}
											}
										} else {
											if (req.body.post.current.mobiledoc) {
												const cards = mobiledoc_updated.cards;
												if (cards) {
													for (const [index, card] of cards.entries()) {
														mobiledoc_updated.cards[updatedCards_gallery_index[i]][1].images[updatedCards_index[i]].src = watermarkedImagePath;
													}
												}
											}
										}
										is_promise = 1;
									}
								})
								.catch((error) => {
									let errorMessage = "1) Error adding watermark to image:" + first_img + " and third img " + third_img + "-";
									if (error.response) {
										if (error.response.statusText) {
											errorMessage += error.response.statusText;
										} else {
											errorMessage += JSON.stringify(error.response);
										}
									} else {
										errorMessage += "Unknown error";
									}
									console.error(errorMessage);
									return null;  
								});
							if (is_promise == 1) {
								watermarkPromises.push(watermarkPromise);
							}
						}

					}
				}
				if (watermarkPromises && watermarkPromises.length > 0 && watermarkPromises.length == updatedCards.length) {
					try {
						await Promise.all(watermarkPromises);
						const url = `https://oemdieselparts.com/ghost/api/admin/posts/${postId}`;
						const headers = {
							Authorization: `Ghost ${token}`,
						};
						payload = {
							posts: [
								{
									id: `${postId}`,
									updated_at: currentDate,
									title: currentTitle,
									mobiledoc: JSON.stringify(mobiledoc_updated),
								},
							],
						};

						if (featureImage != "") {
							payload.posts[0].feature_image = featureImage;
						}
						if (payload != "" && typeof payload !== "undefined") {
							const checkFields = async () => {
								try {
									const headers = {
										Authorization: `Ghost ${token}`,
									};
									const response = await axios.put(url, payload, { headers });
									console.log("Feature SUCCESS " + req.body.post.current.id);
									letsfinish++;
								} catch (error) {
									if (error.response.status === 401) {
										token = generateToken();
										return checkFields();
									} else {
										console.error("ERR:", error.response.statusText);
										throw error;
									}
								}
							};
							await checkFields();
						}
					} catch (error) {
						if (error.response.statusText) {
							console.log(error.response.statusText);
						} else {
							console.log(error);
						}
						console.error("Error with promises:", error.response.statusText);
						res.status(500).json({ message: "An error occurred while processing the webhook." });
					}
				}
			}
		}
	}
}
