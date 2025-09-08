// middleware/auth.js
const passport = require('passport');

const authenticateJWT = (req, res, next) => {
   passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
         console.error('JWT Authentication error:', err);
         return res.status(500).json({
            success: false,
            message: 'Authentication error'
         });
      }

      if (!user) {
         return res.status(401).json({
            success: false,
            message: info?.message || 'Authentication failed'
         });
      }

      req.user = user;
      next();
   })(req, res, next);
};

module.exports = authenticateJWT; 
