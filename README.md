## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

# seeder

    //    "typeorm": "typeorm-extension",
    //    "seed:run": "typeorm-extension seed:run -d src/database/ormconfig.ts -n src/database/seeds/strava.seeder.ts"