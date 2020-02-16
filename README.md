# BadassTerm

BadassTerm is a front-end application writtent in TypeScript that permit to
connect to the server's terminal.

You've 2 possibility for start this application:
* On your local system
* On docker

## System Requirements

### Start on your local system : 
* Linux
* The package manager [yarn](https://yarnpkg.com/)
* The building utility `make`, that you can find on `build-essential`

### Start on docker
* [docker](https://www.docker.com/), what's else ? 

## Installation

### Start on your local system : 
```bash
make prod
```

[http://localhost](http://localhost)

### Start on docker
```bash
docker run -d --name badassterm -p 8080:80 sduplessy/badass_term
```

[http://localhost:8080](http://localhost:8080)

## Contributing
Ideas are welcome. Please open an issue to discuss.

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.