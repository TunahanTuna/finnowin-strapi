FROM node:16
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/app
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn install --ignore-engines

COPY ./ .
RUN chmod 700 .
RUN yarn build --ignore-engines
EXPOSE 1337
CMD ["yarn","develop"]
