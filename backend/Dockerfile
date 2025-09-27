# Use an official Node.js runtime as a parent image
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl


# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies like typescript)
RUN npm install



# Copy source code
COPY . .

RUN npx prisma generate
# RUN npx prisma db push

# Compile TypeScript
RUN npm run build

# Expose app port
EXPOSE 4000

# Run the app using your serve script
CMD ["npm", "run", "serve"]
