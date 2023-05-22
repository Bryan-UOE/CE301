import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { logger } from "../logger.js";

function isPasswordComplex(password) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
}



export const signup = (req, res) => {
  const verificationCode = Math.floor(Math.random() * 1000000);
  const SQLquery = "SELECT * FROM users WHERE email = ? OR username = ?";
  db.query(SQLquery, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length) return res.status(409).json("Account already exists !");

    if(req.body.password.length < 8){
      return res.status(400).send("Password should be a minimum of eight characters");
    } 

    if(!isPasswordComplex(req.body.password)){
      return res.status(400).send("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const SQLquery =
      "INSERT INTO users (username,email,password,verification_code) VALUES (?)";
    const values = [req.body.username, req.body.email, hash, verificationCode];

    db.query(SQLquery, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("User sucessfully created");
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mail.controlsync@gmail.com",
        pass: "dvzssrbcqtwpppvs",
      },
    });

    const mailOptions = {
      from: "mail.controlsync@gmail.com",
      to: req.body.email,
      subject: "Account Verification",
      text: `Your verification code is ${verificationCode}`,
      html: ` 
    
    <div style="background-color: #f2f2f2; padding: 20px;">
        <h1 style="color: #444444; font-size: 28px;">Activate your Account</h1>
            <p style="color: #4d4d4d; font-size: 16px;">Welcome to Control Sync !</p>
                <p style="color: #4d4d4d; font-size: 16px;">Use code below to verify and complete your login:</p>
                    <h2 style="color: #444444; font-size: 24px; font-weight: bold; margin-bottom: 10px;">${verificationCode}</h2>
                    <p style="color: #4d4d4d; font-size: 16px;">If you did not make this request, you can safely disregard this email.</p>
                    <p style="color: #4d4d4d; font-weight: bold; font-size: 14px;">Note:</p>
                    <p style="color: #4d4d4d; font-style: italic; font-size: 14px;">This is an auto-generated message. Please do not reply to this email.</p>
    </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error('An error occurred:', error);
        res.status(500).send("Internal server error");
        return;
      }

      console.log("Verification email sent:", info.response);
      res.send("Verification email sent");
    });
  });
};

export const login = (req, res) => {
  const SQLquery = "SELECT * FROM users WHERE username = ?";

  db.query(SQLquery, [req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (req.body.username == "")
      return res.status(400).json("Please enter username");
    if (req.body.password == "")
      return res.status(400).json("Please enter password");
    if (data.length === 0)
      return res.status(404).json("User does not exists !");

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    // const isVerified = data[0].isVerified;

    if (!checkPassword)
      return res.status(400).json("Username or password is invalid !");
    // if(isVerified != 1) return res.status(400).json("Please verify your email");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(data[other]);
  });
};

export const logout = (req, res) => {
  console.log("BYEBYE");
};

export const checkVerified = (req, res) => {
  const SQLquery = "SELECT isVerified FROM users WHERE username = ?";

  db.query(SQLquery, [req.body.username], (err, data) => {
    console.log("Check verified: " + req.body.username);
    if (err) return res.json(err);
    return res.json(data);
  });
};

export const checkVerificationCode = (req, res) => {
  const code = req.body.verificationCode;
  const sql = "SELECT * FROM users WHERE verification_code = ?";

  db.query(sql, [code], (err, result) => {
    if (err) {
      logger.error('An error occurred:', err);
      res.status(500).send("Internal server error");
    } else if (result.length === 0) {
      res.status(401).send("Verification code is incorrect");
    } else {
      // Update user status in database
      const sqlUpdate = "UPDATE users SET isVerified = ? WHERE id = ?";
      const values = ["1", result[0].id];
      db.query(sqlUpdate, values, (err, result) => {
        if (err) {
          logger.error('An error occurred:', err);
          res.status(500).send("Internal server error");
        } else {
          res.status(200).send("Account verified");
        }
      });
    }
  });
};


export const getUserID = (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(400).send('Access token missing');
  }

  // Verify and decode the access token to retrieve the user ID
  jwt.verify(accessToken, 'jwtkey', (err, decoded) => {
    if (err) {
      return res.status(400).send('Access token invalid');
    } else {
      
      const userId = decoded.id;
      return res.json(userId);
    }
  });
}