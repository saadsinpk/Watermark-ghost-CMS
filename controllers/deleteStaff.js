import axios from "axios";
import path from "path";
import { Console } from "console";
import staff from "../models/staff.js";
import watermark1 from '../models/watermark.js';

let imagePath = "";

export const deleteStaff = async (req, res, next) => {

  try {
    // const { id } = req.body; // Extract the ID from the request body
    const id = req.query.id;
    // Use the appropriate method to delete the staff member by ID
    // For example, if you are using the "staff" model with Mongoose, you can do:
    await staff.findByIdAndDelete(id);

    const watermark = await watermark1.deleteOne({ "userID": id });
    res.status(200).json({ message: "Staff member deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete staff member." });
  }
};
