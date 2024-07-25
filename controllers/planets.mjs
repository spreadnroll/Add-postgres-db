import dotenv from 'dotenv';
import Joi from "joi";
import db from "../db.mjs";

dotenv.config();

export const setupDb = async () => {
  try {
    await db.none(`
      DROP TABLE IF EXISTS planets;
      DROP TABLE IF EXISTS users;

      CREATE TABLE planets (
        id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT
      );

      CREATE TABLE users (
        id SERIAL NOT NULL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        token TEXT
      );
    `);

    await db.none(`INSERT INTO planets (name) VALUES ('Earth')`);
    await db.none(`INSERT INTO planets (name) VALUES ('Mars')`);
    await db.none(`INSERT INTO planets (name) VALUES ('Jupiter')`);
    await db.none(`INSERT INTO planets (name) VALUES ('Namek')`);
    await db.none(`INSERT INTO users (username, password) VALUES ('dummy', 'dummy')`);
  } catch (err) {
    console.error("Error setting up the database:", err);
  }
};

const planetSchema = Joi.object({
  name: Joi.string().required(),
});

export const getAll = async (req, res) => {
  try {
    const planets = await db.many(`SELECT * FROM planets`);
    res.status(200).json(planets);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving planets", error: err });
  }
};

export const getOneById = async (req, res) => {
  const { id } = req.params;
  try {
    const planet = await db.oneOrNone(`SELECT * FROM planets WHERE id=$1`, parseInt(id, 10));
    if (planet) {
      res.status(200).json(planet);
    } else {
      res.status(404).json({ message: "Planet not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving planet", error: err });
  }
};

export const create = async (req, res) => {
  const { name } = req.body;
  const newPlanet = { name };
  const validatedNewPlanet = planetSchema.validate(newPlanet);

  if (validatedNewPlanet.error) {
    return res.status(400).json({msg: validatedNewPlanet.error.details[0].message})
  } else {
    await db.none(`INSERT INTO planets (name) VALUES ($1)`, name);
    res.status(201).json({ msg: 'Planet was created' });
  }
};

export const updateById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const { error } = planetSchema.validate({ name });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedPlanet = await db.oneOrNone(
      `UPDATE planets SET name=$1 WHERE id=$2 RETURNING *`,
      [name, parseInt(id, 10)]
    );

    if (!updatedPlanet) {
      return res.status(404).json({ message: "Planet not found" });
    }

    res.status(200).json({ message: "Planet updated", updatedPlanet });
  } catch (err) {
    res.status(500).json({ message: "Error updating planet", error: err });
  }
};

export const deleteById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPlanet = await db.oneOrNone(`DELETE FROM planets WHERE id=$1 RETURNING *`, [parseInt(id, 10)]);
    if (!deletedPlanet) {
      return res.status(404).json({ message: "Planet not found" });
    }

    res.status(200).json({ message: "Planet deleted", deletedPlanet });
  } catch (err) {
    res.status(500).json({ message: "Error deleting planet", error: err });
  }
};

export const createImage = async (req, res) => {
  console.log(req.file);
  const { id } = req.params;
  const fileName = req.file?.path;

  if (fileName) {
    db.none(`UPDATE planets SET image=$2 WHERE id=$1`, [id, fileName]);
    res.status(201).json({ message: 'Planet image uploaded successfully', file: fileName });
  } else {
    res.status(400).json({ msg: 'No file uploaded' });
  }
};

