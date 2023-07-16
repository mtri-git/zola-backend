const mongoose = require('mongoose');

const idCheckerMiddleware = (req, res, next) => {
    const validFields = ['id', 'commentId', 'postId', 'userId', 'roomId'];
  
    for (const field of validFields) {
      const paramValue = req.params[field];
      if (paramValue && !mongoose.isValidObjectId(paramValue)) {
        return res.status(400).json({ message: `Invalid ${field}` });
      }
    }
    next();
  };

module.exports = idCheckerMiddleware
