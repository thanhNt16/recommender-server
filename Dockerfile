FROM node:10.24.0-alpine3.11

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Copying source files
COPY . /usr/src/app

EXPOSE 8000

# Running the app
CMD "npm" "run" "prod"