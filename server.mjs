import express from "express";
import morgan from "morgan";
import "express-async-errors";
import dotenv from 'dotenv';
import Joi from 'joi';
import fs from 'fs';
import multer from "multer";
import passport from './passport.mjs';
import { setupDb, getAll, getOneById, create, updateById, deleteById, createImage } from './controllers/planets.mjs';
import { logIn, signUp, getUserDetails, logOut } from './controllers/users.mjs';
import { authorize } from "passport";
import authorize from "./authorize.mjs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));

setupDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Error setting up the database:", err);
  process.exit(1);
});

app.post('/api/users/login', logIn);
app.post('/api/users/signup', signUp);
app.get('/api/users/logout', authorize, logOut);



app.get('/api/users/me', passport.authenticate('jwt', { session: false }), getUserDetails);

app.get('/api/planets', getAll);
app.get("/api/planets/:id", getOneById);

const planetSchema = Joi.object({
  name: Joi.string().required(),
});

app.post('/api/planets', async (req, res, next) => {
  try {
    const { error, value } = planetSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    await create(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.put('/api/planets/:id', async (req, res, next) => {
  try {
    const { error, value } = planetSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    await updateById(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.post('/api/planets/:id/image', upload.single("image"), createImage);

app.delete('/api/planets/:id', deleteById);
