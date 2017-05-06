FROM node:boron

RUN useradd --user-group --create-home --shell /bin/false nodejs

ENV HOME=/home/nodejs

COPY package.json $HOME/app/
RUN chown -R nodejs:nodejs $HOME/*
USER nodejs
WORKDIR $HOME/app
RUN npm install

ADD . $HOME/app/
COPY ./docker/admin/DatePicker.d.ts $HOME/app/node_modules/react-toolbox/lib/date_picker/DatePicker.d.ts

ARG client_addr=http://localhost
ARG client_port=3000
ENV CLIENT_ADDR=$client_addr
ENV CLIENT_PORT=$client_port
ENV NODE_ENV=production
RUN npm run build:client
RUN npm run build:css
RUN npm run build:servers
EXPOSE 3000
CMD ["node", "dist/src/client/server.js"]
