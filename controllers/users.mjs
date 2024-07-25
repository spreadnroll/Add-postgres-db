// controllers/users.mjs
import dotenv from 'dotenv';
import db from "../db.mjs";
import jwt from 'jsonwebtoken';

dotenv.config();

const logIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone(`SELECT * FROM users WHERE username=$1`, username);
    if (user && user.password === password) {
      const payload = { id: user.id, username: user.username };
      const token = jwt.sign(payload, process.env.SECRET);
      await db.none(`UPDATE users SET token=$1 WHERE id=$2`, [token, user.id]);
      res.status(200).json({ id: user.id, username: user.username, token });
    } else {
      res.status(400).json({ message: "Username or Password wrong." });
    }
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err });
  }
};

const getUserDetails = async (req, res) => {
  const user = req.user; // User will be populated by passport

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};


const signUp = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone(`SELECT * FROM users WHERE username=$1`, username);

    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const { id } = await db.one(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`, [username, password]);
    res.status(201).json({ id, message: 'User created successfully!' });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err });
  }
};

export { logIn, getUserDetails, signUp };


