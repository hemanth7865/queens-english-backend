# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## Data Base And Migrations TypeORM

1. Run `yarn typeorm migration:create -n MIGRATION_NAME` to create DB migration
2. Run `yarn typeorm migration:run` to run DB migrations

## System cron jobs

**Define cron jobs here**.

**[Status Bage](https://998c8qt5.status.cron-job.org/)**

1. [Generate Zoom Meeting](https://admin.thequeensenglish.co/be/zoom-meetings/active-batches-generate-meetings) -- Every 15 minutes -- light
2. [Generate Licenses](https://admin.thequeensenglish.co/be/zoom-users/generate-active-license) -- Every 10 minutes -- light
3. [Sync Zoom Links To Cosmos](https://admin.thequeensenglish.co/be/zoom/links/sync/cosmos) -- Every 30 minutes -- light
