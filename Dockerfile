# syntax check
FROM nginx:alpine

# Copy the static site into nginx's default web root
COPY site/ /usr/share/nginx/html/

# Use the project's nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Serve plain HTTP on port 80
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
