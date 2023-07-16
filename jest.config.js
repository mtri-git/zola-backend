const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

module.exports = {
  
  setupFiles: ['dotenv/config'],
  // collectCoverage: true,
  // coverageReporters: ['text', 'html'],
  // coverageDirectory: './output/coverage',
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './html-report', // Đường dẫn để lưu trữ các file báo cáo
      filename: 'report.html', // Tên file báo cáo
    }],
  ],
};