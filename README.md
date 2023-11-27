FS22 Discord Bot
================

A bot that monitors a [Farming Simulator 22 Dedicated Server](https://www.farming-simulator.com/) and posts status information in a Discord channel.

What does this bot do?
----------------------

It will show information such as the server's status, the number of players online and players who have joined or left the game. It can also purge its own messages to keep the channel tidy.

### Channel updates

This bot works with a single Farming Simulator 22 Dedicated Server and will post updates like this as the status changes:

**FS22** [BOT] <sub>Today at 10:00</sub>
<br />
:tractor: The server is **back online**!
<br />
:tractor: The server **FS22** has been updated: Farming Simulator 22 (1.12.0.0), Map: Elmcreek, DLCs: 2, Mods: 20
<br />
:joystick: The server has **1** new mod:
<br />
&nbsp;&nbsp;&nbsp;&nbsp;:star2: **Anti-AFK 1.0.1.0** by DJ WoodZ (`d6f656fdd79f073fd9557d8acf847946`)<br />

**FS22** [BOT] <sub>Today at 10:30</sub>
<br />
:farmer: **1** of 4 players online: **Player 1** (`1 January 2023 10:30`).
<br />
&nbsp;&nbsp;&nbsp;&nbsp;:arrow_right: **Player 1** just joined the server.

**FS22** [BOT] <sub>Today at 10:40</sub>
<br />
:farmer: **2** of 4 players online: **Player 1 and Player 2** (`1 January 2023 10:40`).
<br />
&nbsp;&nbsp;&nbsp;&nbsp;:arrow_right: **Player 2** just joined the server.

**FS22** [BOT] <sub>Today at 12:45</sub>
<br />
:farmer: **1** of 4 players online: **Player 2** (`1 January 2023 12:45`).
<br />
&nbsp;&nbsp;&nbsp;&nbsp;:arrow_left: **Player 1** just left the server after playing for **2 hours and 15 minutes**.

**FS22** [BOT] <sub>Today at 12:50</sub>
<br />
:farmer: **0** of 4 players online (`1 January 2023 12:50`).
<br />
&nbsp;&nbsp;&nbsp;&nbsp;:arrow_left: **Player 2** just left the server after playing for **2 hours and 10 minutes**.

**FS22** [BOT] <sub>Today at 13:00</sub>
<br />
:moneybag: Savegame Money: :arrow_up_small: **123,456** (+1,234).
<br />
:watch: Savegame Play Time: **11 days, 22 hours and 33 minutes**.


### Activity updates

It will also update its current activity (status) to show the Dedicated Server's current status and number of online players:

**FS22** [BOT]
<br />
<sup>Playing **online: 2/4**</sup>

How does it work?
-----------------

The bot is fully automatic. It does not require or respond to Discord user commands.

It retrieves the status of the server by polling the server's XML feed endpoints (`/feed/dedicated-server-savegame.html` and `/feed/dedicated-server-stats.xml`). By default it will poll once per minute.

Permissions
-----------

The only permission this bot requires is the `Send Messages` permission, which can be found in the [Discord Developer Portal](https://discord.com/developers/) under: `bot` -> `Text Permission` -> `Send Messages`

Environment Variables
---------------------

Copy the `.env` file and create an `.env.local` file for your environment variables. You will then need to edit the `.env.local` file.

### Can I just edit the `.env` file?

It would work but you shouldn't do that. It is good practice to create and edit an `.env.local` file because it will be excluded from commits by the `.gitignore` file, whereas the `.env` file will not be excluded from commits.

### Which variables must I edit?

As a minimum you will need to specify a `FS22_BOT_DISCORD_TOKEN` value, which you obtain via the [Discord Developer Portal](https://discord.com/developers/). You will also need to verify that the `FS22_BOT_URL_CAREER_SAVEGAME` and `FS22_BOT_URL_SERVER_STATS` values are correct.

### Anything else to be aware of?

By default the bot will post to all channels it has access to on all servers it has been added to.

You should use Discord's roles and permissions to control which channels it can post to, but you can also specify the `FS22_BOT_DISCORD_SERVER_NAME` and `FS22_BOT_DISCORD_CHANNEL_NAME` values to further ensure it only posts to your chosen Discord server and/or channel. This is recommended.

Be sure to spell the server and channel names exactly as written in Discord.

### What about purging?

By default purging is disabled. When enabled, it will only purge its own messages and it will only purge from the specified channel on the specified server, both of which must be set using `FS22_BOT_PURGE_DISCORD_CHANNEL_SERVER_NAME` and `FS22_BOT_PURGE_DISCORD_CHANNEL_NAME`.

Be sure to spell the server and channel names exactly as written in Discord.

If you do not want the bot to purge its old messages, simply leave these values blank.

### Environment Variables

* `FS22_BOT_DB_PATH` (Default: `./db.json`) - The path to the database JSON file (the file will be created if it doesn't exist)
* `FS22_BOT_DISABLE_CERTIFICATE_VERIFICATION` (Default: `false`) - Whether to disable SSL certificate verification (for HTTPS XML URLs)
* `FS22_BOT_DISABLE_UNREACHABLE_FOUND_MESSAGES` (Default: `false`) - Whether to disable "The server is unreachable." and "The server has been found." messages.
* `FS22_BOT_DISCORD_CHANNEL_NAME` (Default: *blank*) - The Discord channel name to post in (leave blank for all channels the bot has access to)
* `FS22_BOT_DISCORD_SERVER_NAME` (Default: *blank*) - The Discord server name to post in (leave blank for all servers the bot has access to)
* `FS22_BOT_DISCORD_TOKEN` (Default: `YOUR_DISCORD_TOKEN`) - Your Discord bot token (from the [Discord Developer Portal](https://discord.com/developers/))
* `FS22_BOT_FETCH_RETRIES` (Default: `5`) - The number of times to retry failed fetches
* `FS22_BOT_FETCH_RETRY_DELAY_MS` (Default: `2000`) - The delay between fetch retries (in milliseconds)
* `FS22_BOT_POLL_INTERVAL_MINUTES` (Default: `1`) - How frequently to poll the Dedicated Server (in minutes)
* `FS22_BOT_PURGE_DISCORD_CHANNEL_AFTER_DAYS` (Default: `7`) - How old messages must be before they are deleted (in days)
* `FS22_BOT_PURGE_DISCORD_CHANNEL_AFTER_LINES` (Default: *blank*) - The maximum number of messages to keep
* `FS22_BOT_PURGE_DISCORD_CHANNEL_HOUR` (Default: `2`) - The hour of the day to perform the purge in UTC (e.g. `2` for 2am (UTC))
* `FS22_BOT_PURGE_DISCORD_CHANNEL_NAME` (Default: *blank*) - The Discord channel name to purge (leave blank to disable purging)
* `FS22_BOT_PURGE_DISCORD_CHANNEL_SERVER_NAME` (Default: *blank*) - The Discord server name with the channel to purge (leave blank to disable purging)
* `FS22_BOT_URL_CAREER_SAVEGAME` (Default: `http://localhost:8080/feed/dedicated-server-savegame.html`) - The dedicated-server-savegame.html?file=careerSavegame URL including code, e.g. `http://localhost:8080/feed/dedicated-server-savegame.html?code=ABCD1234&file=careerSavegame`
* `FS22_BOT_URL_SERVER_STATS` (Default: `http://localhost:8080/feed/dedicated-server-stats.xml`) - The dedicated-server-stats.xml URL including code, e.g. `http://localhost:8080/feed/dedicated-server-stats.xml?code=ABCD1234`

Installation
------------

You can either run this project directly on a host machine, or you can run it in a docker container. If you are going to be running it directly, the dependencies will need to be installed.

### Running directly on host machine

You need [git](https://git-scm.com/) and [Node.js](https://nodejs.org/) to be installed, then you must clone this repository and install the dependencies:

```
git clone https://github.com/DJWoodZ/FS22-Discord-Bot.git
cd FS22-Discord-Bot
npm install
```

#### CLI Commands

* `npm start` - Run the Discord bot normally
* `npm run update` - Update the local database (useful for getting current state of server without posting status information in Discord)
* `npm run dev` - Run the Discord bot in 'development' mode (uses nodemon* to restart automatically on .js code changes)
* `npm run pm2:start` - Run the Discord bot as a daemon (uses PM2**)
* `npm run pm2:stop` - Stop the Discord bot daemon (uses PM2**)

\* Install nodemon globally first with `npm install nodemon -g`
<br />
\** Install PM2 globally first (see below)

#### Installing as a service (with PM2)

The `npm run pm2:start` and `npm run pm2:stop` scripts use a global PM2 NPM dependency.

##### Installing PM2 globally

```
npm install pm2@latest -g
```

##### Run as a service (Linux, etc.)

To ensure the Discord bot service starts automatically following a system reboot:

```
npm run pm2:start
pm2 startup
pm2 save
```

See the [PM2 Process Management Quick Start](https://pm2.keymetrics.io/docs/usage/quick-start/) for details.

##### Run as a service (Windows)

To run as a service on Windows, you will need to use [pm2-installer](https://github.com/jessety/pm2-installer).

To ensure the Discord bot service starts automatically following a system reboot:

```
npm run pm2:start
pm2 save
```

See the [PM2 Process Management Quick Start](https://pm2.keymetrics.io/docs/usage/quick-start/) for details.

### Running with Docker Compose

This project comes pre-configured ready for use with Docker Compose.

The default Docker Compose configuration (`compose.yaml`) will use the `.env.local` file on the host machine.

The `FS22_BOT_DB_PATH` value in `.env.local` will be ignored by the Docker Compose configuration. The default Docker Compose configuration will create and use a database JSON file located on the host machine at: `.\docker-volumes\db\db.json`.

You need [git](https://git-scm.com/), [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) to be installed and then you must clone this repository:

```
git clone https://github.com/DJWoodZ/FS22-Discord-Bot.git
```

#### Running normally

```
docker compose up
```

#### Running in detached mode

To run as a service, use detached mode:

```
docker compose up -d
```

#### Force build and recreation

If you need to force Docker Compose to build the image and recreate the container, you can use the `--build` and `--force-recreate` options:

```
docker compose up --build --force-recreate
```

This can also be used with detached mode:

```
docker compose up -d --build --force-recreate
```

For a full list of options see the [`docker compose up`](https://docs.docker.com/engine/reference/commandline/compose_up/) documentation.

#### Interacting with the container

For development only.

If you need to interact with the container, you can use this command (assuming the container is named `fs22-discord-bot-server-1`):

```
docker exec -it fs22-discord-bot-server-1 /bin/sh
```
