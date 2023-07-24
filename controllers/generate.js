import postCreate from "../models/Post.js";
import axios from "axios";
import IMAGE from "../models/image.js";
import stream from "stream";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import ReplaceStatus from "../models/replacepage.js";
import path from "path";
import fs from "fs";
import { json } from "stream/consumers";
import { Update } from "./PostUpdate.js";
import { Updatepage12 } from './Updatepage.js'
import fsx from 'fs-extra';


const key = "6492802eb312980350eae3cf:fb5fb378053efe19fd0b06e551cca071d3331b8d2f7cb638b5645c7c96c63e5f";

let token = generateToken();

function generateToken() {
  const [id, secret] = key.split(":");
  const expiresInMinutes = 60; // Expiration time in minutes

  return jwt.sign({}, Buffer.from(secret, "hex"), {
    keyid: id,
    algorithm: "HS256",
    expiresIn: expiresInMinutes * 60, // Expiration time in seconds
    audience: "/admin/",
  });
}
const checkFields = async (url1) => {
  const headers = {
    Authorization: `Ghost ${token}`,
  };
  try {
    const response1 = await axios.get(url1, { headers });
    const responseData = response1.data;
    if (responseData) {
      for (const innerpost of responseData.posts) {
        console.log("start postId " + innerpost.id);
        const processedData = processPostData(innerpost);
        try {
          await Update(processedData);
        } catch (error) {
          console.error("An error occurred during the Update:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("end postId");
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      token = generateToken();
      return checkFields();
    } else {
      if (error.response && error.response.statusText) {
        console.error("Error:", error.response.statusText);
      } else {
        console.error("Error:", error);
      }
    }
  }
}

export const Allimage = async (req, res, next) => {
  try {
    async function generate() {
      const apiUrl = 'https://oemdieselparts.com/ghost/api/content/posts/?key=62ba5f4d0ae64abf8445ee2054';
      let isFetchingComplete = false;
      let count_array = 0

      const fetchPage = async (page) => {
        const url = `${apiUrl}&page=${page}&limit=200`;
        try {
          const response = await axios.get(url);
          console.log(response.data.meta);
          const data = response.data;
          const { posts, meta } = data;

          const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          for (const post of posts) {
            const postId = post.id;

            const url1 = `https://oemdieselparts.com/ghost/api/admin/posts/${postId}`;

            count_array++;
            console.log(count_array);
            await checkFields(url1);
            if (count_array == 200) {
              if (response.data.meta && response.data.meta.pagination) {
               count_array = 0;
               await fetchPage(response.data.meta.pagination.next);
              } else {
                isFetchingComplete = true;
              }
              break;
            }

          }
        } catch (error) {
          if (error.response) {
            console.error("Error retrieving data:", error.response);
          } else {
            console.error("Error retrieving data:", error);
          }
        }
      };
      fetchPage(1);


    }
    generate();

    console.log("Post Update webhook hit");
  } catch (error) {
    console.error(error.response);
  }
}

function processPostData(postData) {
  const postId = postData.id;
  const mobiledoc = JSON.parse(postData.mobiledoc);
  const featureImage = postData.feature_image;
  const author = postData.primary_author;
  const updated_at = postData.updated_at;
  const title = postData.title;


  const processedData = {
    body: {
      post: {
        current: {
          id: postId,
          updated_at: updated_at,
          title: title,
          mobiledoc: JSON.stringify(mobiledoc),
          feature_image: featureImage,
          primary_author: author,
        },
      },
    },
    generate: "yes",
  };

  return processedData;
}

