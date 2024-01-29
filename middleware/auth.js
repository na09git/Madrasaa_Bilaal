const User = require('../models/User');
const Worker = require('../models/Worker');
const passport = require('passport');

module.exports = {
  ensureAuth: async function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  },

  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/story');
    } else {
      return next();
    }
  },

  ensureAdmin: async function (req, res, next) {
    try {
      if (req.isAuthenticated()) {
        const user = await User.findOne({ googleId: req.user.googleId });

        if (user && isAdminUser(user.googleId)) {
          return next();
        } else {
          res.redirect('/');
          console.log("Sorry, Only Admin Allowed to Access this page!");
        }
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },

  ensureWorker: async function (req, res, next) {
    try {
      if (req.isAuthenticated()) {
        const user = await User.findOne({ googleId: req.user.googleId });

        if (user && await isWorkerUser(user.googleId)) {
          return next();
        } else {
          res.redirect('/');
          console.log("Sorry, Only Workers Allowed to Access this page!");
        }
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },

  ensureAdminOrWorker: async function (req, res, next) {
    try {
      if (req.isAuthenticated()) {
        const user = await User.findOne({ googleId: req.user.googleId });

        if (user && (isAdminUser(user.googleId) || await isWorkerUser(user.googleId))) {
          return next();
        } else {
          res.redirect('/');
          console.log("Sorry, Only Admin or Workers Allowed to Access this page!");
        }
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },
};

// Function to check if the user has admin privileges
function isAdminUser(googleId) {
  // Add your logic here to determine if the user has admin privileges
  // For example, you might compare it to a specific admin googleId
  const adminGoogleId = '111415507315075202327';
  return googleId === adminGoogleId;
}

// Function to check if the user has worker privileges based on position
async function isWorkerUser(googleId) {
  try {
    const worker = await Worker.findOne({ user: { googleId: googleId } });

    // Check if the worker exists and has a valid position
    return worker && worker.position && ['Teacher', 'Manager', 'Ustaz', 'Cleaner', 'Security', 'Driver', 'Cashier', 'Director', 'IT-Technician'].includes(worker.position);
  } catch (error) {
    console.error(error);
    return false;
  }
}
