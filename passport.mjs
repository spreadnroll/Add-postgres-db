
import * as dotenv from "dotenv";
import passport from "passport";
import passportJWT from "passport-jwt";
import db from "./db.mjs";

dotenv.config();

const { SECRET } = process.env;

passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await db.oneOrNone(`SELECT * FROM users WHERE id=$1`, jwtPayload.id);
        return user ? done(null, user) : done(new Error("User not found"));
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
