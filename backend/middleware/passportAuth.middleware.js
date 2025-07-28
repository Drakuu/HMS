require("dotenv").config();
const passport = require("passport");
const hospitalModel = require("../models/index.model");
const { ExtractJwt } = require("passport-jwt");
const JwtStrategy = require("passport-jwt").Strategy;

const JWT_SECRET = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // const user = await hospitalModel.User.findOne({
      //   $or: [
      //     { user_Email: jwt_payload.user_Email },
      //     { user_Identifier: jwt_payload.user_Identifier }
      //   ]
      // });

      // console.log("The JWT payload is:", jwt_payload);
      // console.log("Authenticated user:", user);
// console.log("The jwt jwt_payload: ", jwt_payload)
      if (jwt_payload) {
        return done(null, jwt_payload); // Authentication successful
      } else {
        return done(null, false, { message: "User not found" }); // User not found
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      return done(error, false, { message: "Error during authentication" }); // General error
    }
  })
);

module.exports = passport;
