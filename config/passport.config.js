const passport = require("passport");
const User = require("../models/user.model");
const SlackStrategy = require("passport-slack").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

console.log(process.env.SLACK_CLIENT_ID)

const slack = new SlackStrategy(
  {
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    callbackUrl: "/auth/slack",
  },
  (accessToken, refreshToken, profile, next) => {
    User.findOne({ "social.slack": profile.id })
      .then((user) => {
        if (user) {
          next(null, user);
        } else {
          const newUser = new User({
            name: profile.displayName,
            username: profile.user.email.split("@")[0],
            email: profile.user.email,
            avatar: profile.user.image_1024,
            password:
              profile.provider + Math.random().toString(36).substring(7),
            social: {
              slack: profile.id,
            },
          });

          newUser
            .save()
            .then((user) => {
              next(null, user);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  }
);

const google = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
  },

  (accessToken, refreshToken, profile, next) => {
     User.findOne({ "social.google": profile.id })
      .then((user) => {
        if (user) {
          next(null, user);
        } else {
          const newUser = new User({
            name: profile.displayName,
            username: profile.emails[0].value.split("@")[0],
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            password: profile.provider + Math.random().toString(36).substring(7),
            social: {
              google: profile.id,
            },
          });

          newUser
            .save()
            .then((user) => {
              next(null, user);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
   }
);

passport.serializeUser(function(user, next) {
  next(null, user);
});
passport.deserializeUser(function(user, next) {
  next(null, user);
});

passport.use(slack);
passport.use(google);

module.exports = passport.initialize();