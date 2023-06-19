import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
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
// memberSchema.pre('save', function (next) {
//     const member = this;
//     if (!member.isModified('member.current.password')) {
//         return next();
//     }

//     const randomPassword = generateRandomPassword();

//     member.member.current.password = randomPassword;
//     next();
// });

// // Helper function to generate a random alphanumeric password
// function generateRandomPassword() {
//     const length = 8; // Length of the password
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let password = '';
  
//     for (let i = 0; i < length; i++) {
//       const randomIndex = Math.floor(Math.random() * characters.length);
//       password += characters.charAt(randomIndex);
//     }
  
//     return password;
// }

memberSchema.pre('save', function (next) {
    const member = this;
    if (!member.isModified('member.current.password')) {
      return next();
    }
  
    const randomPassword = generateRandomPassword();
  
    member.member.current.password = randomPassword;
    sendEmail(member.member.current.email, randomPassword); // Send email with the generated password
    next();
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
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'saadirfan465@gmail.com',
          pass: 'ggdkqhgufudcgkpm',
        },
      });
  
      const info = await transporter.sendMail({
        from: '"Password 👻" <saadirfan465@gmail.com>',
        to: email,
        subject: 'Password Reset',
        text: `Your new password: ${password}`,
        html: `<b>Your new password: ${password}</b>`,
      });
  
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error('Error sending email:', err);
    }
  }

const Member = mongoose.model('Member', memberSchema);

export default Member;
