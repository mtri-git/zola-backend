const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

module.exports = {
  setupFiles: ['dotenv/config']
};