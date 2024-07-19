import express from "express";
import morgan from "morgan";
import "express-async-errors";
import dotenv from 'dotenv';
import Joi from 'joi';
import { setupDb, getAll, getOneById, create, updateById, deleteById } from './controllers/planets.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));


setupDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Error setting up the database:", err);
  process.exit(1); 
});


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

app.delete('/api/planets/:id', deleteById);
