.PHONY: prod dev docker docker_build docker_remove install install_dev build run clean

PORT ?= 80

prod: install build run
dev: install_dev watch
docker: docker_build docker_run

docker_build:
	docker build -t pepsit36/badass_term .;

docker_run:
	docker run -d -p ${PORT}:80 --name badass_term pepsit36/badass_term;

docker_remove:
	docker rm -f badass_term;

install:
	cd client; yarn install --production=true;
	cd server; yarn install --production=true;

install_dev:
	cd client; yarn install --production=false;
	cd server; yarn install --production=false;

build:
	cd client; yarn build;
	cd server; yarn build;

run:
	cd server; yarn start;

watch:
	cd client; yarn run dev; yarn run watch&
	cd server; yarn run watch

clean:
	cd client; rm -rf build node_modules public/build;
	cd server; rm -rf build node_modules;
