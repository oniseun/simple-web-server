FROM public.ecr.aws/docker/library/node:18.19.0-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install

COPY . .

FROM public.ecr.aws/docker/library/node:18.19.0-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/.env.copy ./.env

EXPOSE 3000

CMD ["npm", "run", "start"]