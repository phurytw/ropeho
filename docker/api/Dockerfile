FROM ubuntu

# install ffmpeg
RUN apt-get update
RUN apt-get install -y ffmpeg \
    curl \
    build-essential \  
    python
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash
RUN apt-get install -y nodejs

# set environment
ENV HOME=/home/node

# create user
RUN groupadd -r node && useradd -r -g node node
RUN mkdir -p $HOME/app
WORKDIR $HOME/app
RUN chown -R node:node $HOME/*

# package.json
COPY package.json $HOME/app/package.json
RUN npm install

# typescript and ts-node and also mocha
RUN npm install -g typescript ts-node mocha

# prepare to run as node
USER node

# copying files
ADD . $HOME/app/

# fixing type definition
COPY ./docker/admin/DatePicker.d.ts $HOME/app/node_modules/react-toolbox/lib/date_picker/DatePicker.d.ts

# building app
ENV NODE_ENV=production
RUN npm run build:servers
EXPOSE 8000
CMD ["node", "dist/src/server/index.js"]
