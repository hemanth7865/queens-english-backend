# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

# Data Base And Migrations TypeORM

1. Run `yarn typeorm migration:create -n MIGRATION_NAME` to create DB migration
2. Run `yarn typeorm migration:run` to run DB migrations