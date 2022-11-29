"use strict";
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const { getUserLogin } = require("../models/userModel");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcryptjs');
require("dotenv").config();
// local strategy for username password login
passport.use(
  new Strategy(async (username, password, done) => {
    const params = [username];
    try {
      const [user] = await getUserLogin(params);
      console.log("Local strategy", user); // result is binary row
      if (user === undefined) {
        return done(null, false, { message: "Incorrect email." });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user, { message: "Logged In Successfully" });
    } catch (err) {
      return done(err);
    }
  })
);

// JWT strategy for handling bearer token
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
          return done(null, jwtPayload);
    }
  )
);

// consider .env for secret, e.g. secretOrKey: process.env.JWT_SECRET

module.exports = passport;
