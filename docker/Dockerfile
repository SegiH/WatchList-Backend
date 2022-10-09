FROM node:16.16.0

COPY watchlistbackend.js /
COPY package.json /
WORKDIR /
RUN npm install

EXPOSE 8080

CMD [ "node" , "/watchlistbackend.js" ]
