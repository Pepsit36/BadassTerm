FROM debian

RUN apt-get update; apt-get install -y curl apt-utils build-essential;
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -; apt-get update && apt-get install -y nodejs;
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -; echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list; apt-get update && apt-get install yarn;

WORKDIR /usr/src/app

ARG PORT=80

ENV HOST "0.0.0.0"
ENV PORT ${PORT}
ENV NODE_ENV prod

COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY Makefile Makefile

RUN make install

COPY . .

RUN make build

EXPOSE ${PORT}

CMD make run;
