import mongoose from "mongoose";
import createError from 'http-errors';
import Page from "../models/Page.js";
import ReplaceStatus from "../models/replacepage.js";
import fsx from 'fs-extra';
import fs from 'fs';


export const pagedelete = async (req, res, next) => {

  console.log(req.body.page.previous.id);
  // res.send("hello")
  try {
    const postId = req.body.page.previous.id;


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
            // console.log(`An error occurred while deleting file '${path}': ${err.message}`);
          }
        } else {
          console.log(`File '${path}' deleted successfully.`);
        }
      });
    }

    const img = await ReplaceStatus.findOne({ "id": postId })
    console.log(img.feature_image, "asdadaghshjsbf");
    const pathArray = img.feature_image.split("/");
    const deleteimg_name = pathArray[pathArray.length - 1];
    const delete_directoryPath = './public/' + deleteimg_name + 'content';
    deleteDirectory(delete_directoryPath);
    console.log(deleteimg_name);
    deleteFile('./public/' + deleteimg_name)
    console.log(delete_directoryPath, "final");
    await Page.deleteOne({ "page.current.id": postId });
    res.status(204).send("success");
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the post' });
  }

}

