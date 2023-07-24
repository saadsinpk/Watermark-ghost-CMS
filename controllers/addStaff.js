import staff from "../models/staff.js";

export const addStaff = async (req, res, next) => {
  try {
    const { email, name, password } = req.body; // Assuming the request body contains email, name, and password
    console.log(req.body);
    
    // Check if a staff member with the given email already exists
    const existingStaff = await staff.findOne({ "member.current.email": email });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff member already exists." });
    }

    // Create a new staff member
    const newStaff = new staff({
      member: {
        current: {
          email,
          name,
          password,
          // Add other fields as needed
        },
      },
    });

    // Save the new staff member to the database
    await newStaff.save();

    res.status(201).json({ message: "Staff member added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add staff member." });
  }
};
