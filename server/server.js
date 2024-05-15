const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "registrations.json";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "prakashreddy.eega@gmail.com",
    pass: "aoee udcp woer vfdk",
  },
});

app.post("/register", (req, res) => {
  const { fullName, email, phone, eventSessions } = req.body;
  const registrationId = uuidv4();
  const registrationData = {
    registrationId,
    fullName,
    email,
    phone,
    eventSessions,
  };
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  const isValidPhone = /^\d+$/.test(phone);

  if (fullName && isValidEmail && isValidPhone && eventSessions.length) {
    fs.readFile(DATA_FILE, (err, data) => {
      if (err) {
        setTimeout(() => {
          console.error("Error parsing JSON:", parseError);
          return res.status(500).json({ error: "Internal Server Error" });
        }, 1000);
      }
      const registrations = JSON.parse(data);
      registrations.push(registrationData);
      fs.writeFile(DATA_FILE, JSON.stringify(registrations, null, 2), (err) => {
        if (err) throw err;
        setTimeout(() => {
          sendConfirmationEmail(email, registrationData)
          res.json(registrationData);
        }, 1000);
      });
    });
  } else {
    setTimeout(() => {
      return res.status(400).json({
        error: "Please fill out all fields and select at least one session.",
      });
    },1000);
  }
});


const sendConfirmationEmail = (to, data) => {
  const mailOptions = {
    from: {name: "Prakash Reddy",address: "prakashreddy.eega@gmail.com"},
    to:  [to],
    subject: "Event Registration Confirmation",
    html: `
      <h2>Thank you for registering!</h2>
      <p>Registration ID: ${data.registrationId}</p>
      <p>Name: ${data.fullName}</p>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phone}</p>
      <p>Sessions: ${data.eventSessions.join(", ")}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
