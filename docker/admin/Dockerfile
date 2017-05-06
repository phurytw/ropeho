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

ARG admin_addr=http://localhost
ARG admin_port=3010
ENV ADMIN_ADDR=$admin_addr
ENV ADMIN_PORT=$admin_port
ENV NODE_ENV=production
RUN npm run build:admin
RUN npm run build:css
RUN npm run build:servers
EXPOSE 3010
CMD ["node", "dist/src/admin/server.js"]
