require("dotenv").config();
const passport = require("passport");
const hospitalModel = require("../models/index.model");
const { ExtractJwt } = require("passport-jwt");
const JwtStrategy = require("passport-jwt").Strategy;

const JWT_SECRET = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET, // It's recommended to use environment variables for secrets.
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await hospitalModel.User.findOne({
        user_Email: jwt_payload.identifier,
      });
      console.log("The user was is:" , jwt_payload, user)
      if (user) {
        return done(null, user); // Authentication successful
      } else {
        return done(null, false, { message: "User not found" }); // User not found
      }
    } catch (error) {
      return done(error, false, { message: "Error during authentication" }); // General error
    }
  })
);

module.exports = passport;
