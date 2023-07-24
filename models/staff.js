import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const memberSchema = new mongoose.Schema({
  member: {
    current: {
      id: String,
      uuid: String,
      email: String,
      name: String,
      note: String,
      geolocation: String,
      subscribed: Boolean,
      created_at: Date,
      updated_at: Date,
      labels: Array,
      subscriptions: Array,
      avatar_image: String,
      comped: Boolean,
      email_count: Number,
      email_opened_count: Number,
      email_open_rate: Number,
      status: String,
      last_seen_at: Date,
      tiers: Array,
      newsletters: Array,
      password: String,
    },
    previous: Object,
  },
});

memberSchema.pre('save', async function (next) {
  const member = this;
  let randomPassword = '';
  console.log("password");
  if(member.member.current.password) {
    randomPassword = member.member.current.password;
  } else {
    randomPassword = generateRandomPassword();
  }

  try {
    const existingUser = await Member.findOne({ 'member.current.email': member.member.current.email });

    if (existingUser) {
      // User already exists, update the password if modified
      if (member.isModified('member.current.password')) {
        try {
          await sendEmail(member.member.current.email, randomPassword); // Send email with the generated password
          existingUser.member.current.password = randomPassword;
          await existingUser.save();
        } catch (err) {
          return next(err);
        }
      }
    } else {
      // User doesn't exist, proceed with saving the member document
      await sendEmail(member.member.current.email, randomPassword); // Send email with the generated password
      member.member.current.password = randomPassword;
    }

    next();
  } catch (err) {
    return next(err);
  }
});

// Helper function to generate a random alphanumeric password
function generateRandomPassword() {
  const length = 8; // Length of the password
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
}

async function sendEmail(email, password) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 465,
      secure: true, // Enable a secure connection
      auth: {
        user: 'postmaster@oemdieselparts.com',
        pass: 'Test123456',
      },
    });

    const info = await transporter.sendMail({
      from: '"Password 👻" <admin@oemdieselparts.com>',
      to: email,
      subject: 'Password',
      text: `Your new password: ${password}`,
      html: `<b>Your new password: ${password}</b>`,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Error sending email:', err);
    throw err; // Rethrow the error to be caught by the caller
  }
}


const Member = mongoose.model('Member', memberSchema);
// const Member = "";

export default Member;