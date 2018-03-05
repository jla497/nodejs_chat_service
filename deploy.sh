#!/bin/bash
echo "in deploy.sh"

NAME="node-server"
IMG="node-server:dev"
CONTAINER="$(docker ps -q -f name=$NAME)"
 echo $CONTAINER
 
if [ -z CONTAINER ]; then
   echo "no existing container"
   
else
  docker stop $NAME && docker rm -f $NAME
  docker rmi $IMG

fi
    # remove image
    

    # run your container
    docker build -t $IMG .
    docker run -d --name $NAME -p 3000:3000 $IMG
  