import axios from "axios";
import staff from "../models/staff.js";

export const getStaff = async (req, res, next) => {
  try {
    const staffList = await staff.find({}); // Retrieve all staff members

    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve staff members." });
  }
};
