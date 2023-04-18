# sử dụng image của Node.js v16
FROM node:16

# cài đặt Yarn sử dụng npm
RUN npm install --global yarn

# thiết lập thư mục làm việc
WORKDIR /app

# sao chép package.json và yarn.lock vào thư mục /app
COPY package.json yarn.lock /app/

# cài đặt các gói phụ thuộc
RUN yarn install

# sao chép tất cả các file trong thư mục hiện tại vào /app
COPY . /app

# chạy ứng dụng
CMD ["yarn", "start"]