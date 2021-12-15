FROM node:14

COPY watchlistbackend.js /
COPY package.json /

RUN npm install
RUN npm install --save express
RUN npm install --save mssql
RUN npm install --save request

EXPOSE 8080

CMD [ "node" , "/watchlistbackend.js" ]
