FROM golang:1.8.0-alpine

COPY ./dist /usr/src/app/dist
COPY ./files /usr/src/app
RUN ls /usr/src/app
EXPOSE 8100
CMD ["/usr/src/app/files","-d","/usr/src/app/dist"]

