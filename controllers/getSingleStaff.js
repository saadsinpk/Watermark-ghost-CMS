import axios from "axios";
import staff from "../models/staff.js";

export const getSingleStaff = async (req, res, next) => {
  try {
	const id = req.query.id; // Extract the ID from the request body
  console.log(id);
    const staffMember = await staff.findById(id); // Retrieve the staff member by ID

    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    res.status(200).json(staffMember);

  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve staff members." });
  }
};
