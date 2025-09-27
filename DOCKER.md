docker info #to check docker status
docker build -t backend:latest .  # to build docker
docker images #to check images
docker run -it --rm backend:latest # to run docker
docker-compose exec backend npx prisma db push # to exec prisma schema
docker run -it --rm backend:latest sh # to list docker items (file/folder)
docker-compose logs -f (View the logs of the docker containers.) 

docker-compose up --build -d (Rebuild and restart the docker containers.)
docker run -it --rm -p 4000:4000 backend:latest

build the entier thing 
docker-compose up --build

docker-compose logs -f worker


# Stop Docker Desktop completely first
osascript -e 'quit app "Docker"'

# Remove the VM data
rm -rf ~/Library/Containers/com.docker.docker/Data/vms/0/
