FROM node:14

COPY watchlistbackend.js /
COPY package.json /

RUN npm install

EXPOSE 8080

CMD [ "node" , "/watchlistbackend.js" ]