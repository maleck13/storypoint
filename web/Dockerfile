FROM golang:1.10

COPY ./dist /usr/src/app/dist
COPY ./files /usr/src/app
RUN ls /usr/src/app
CMD ["/usr/src/app/files","-d","/usr/src/app/dist"]

