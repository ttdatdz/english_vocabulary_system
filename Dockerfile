# ======== Stage 1: Build React app ========
FROM node:20-alpine AS build

# Tăng giới hạn bộ nhớ cho Node để tránh lỗi "heap out of memory"
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copy file package.json và package-lock.json để tận dụng cache layer
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Build app cho production (nếu bạn dùng CRA)
RUN npm run build

# ===== Runtime (serve static) =====
FROM node:20-alpine
WORKDIR /app

# serve hỗ trợ SPA fallback (-s)
RUN npm i -g serve@14

# copy artifact từ stage build
COPY --from=build /app/build ./build

EXPOSE 5173
CMD ["serve","-s","build","-l","5173"]


# ======== Stage 2: Serve with Nginx ========
# FROM nginx:alpine

# # Copy file cấu hình Nginx tùy chỉnh để fix lỗi reload 404
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy file build từ stage 1 sang thư mục Nginx phục vụ
# COPY --from=build /app/build /usr/share/nginx/html

# # Mở cổng 80 để serve frontend
# EXPOSE 80

# # Chạy Nginx
# CMD ["nginx", "-g", "daemon off;"]
