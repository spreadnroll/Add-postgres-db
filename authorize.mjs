import { request, response, next } from "express";
import passport from "passport";

const authorize = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default authorize;
