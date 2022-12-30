#This will delete all containers AND images, I only use this in extreme cases

docker ps -aq
# Stop running containers
docker stop $(docker ps -aq)
# kill all containers
docker rm $(docker ps -aq)
# delete docker images
docker rmi $(docker images -q)
# delete all volumes
docker volume rm $(docker volume ls -q)
