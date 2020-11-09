# Commando MongoDBProvider
[![Downloads](https://img.shields.io/npm/dt/commando-provider-mongo.svg)](https://www.npmjs.com/package/commando-provider-mongo)
[![Version](https://img.shields.io/npm/v/commando-provider-mongo.svg)](https://www.npmjs.com/package/commando-provider-mongo)
[![Dependency status](https://david-dm.org/ItsDizzy/commando-provider-mongo.svg)](https://david-dm.org/ItsDizzy/commando-provider-mongo)

 MongoDB provider for Commando

## About
[Commando](https://github.com/Gawdl3y/discord.js-commando) is the official framework for [discord.js](https://github.com/hydrabolt/discord.js), I like how easy it is to get started with it and add own commands, types, etc. Recently I started working on a bot that required to be connected to MongoDB. I converted the default SQLLiteProvider into a provider that could use MongoDB as storage.

## Installation
>If you want to use node-mongodb-native@2.2, use commando-provider-mongo@1.0.0!
```bash
# With Yarn (recommended)
yarn add mongodb commando-provider-mongo

# With NPM
npm install --save mongodb commando-provider-mongo
```

## Usage
Below is an example on how to use it with [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) (recommended). There are probably other mongodb clients whose are able to return a Db instance of MongoClient and you are free to use them. However I will not deliver any support if you use another client.

```js
const MongoClient = require('mongodb').MongoClient;
const MongoDBProvider = require('commando-provider-mongo');

...

client.setProvider(
	MongoClient.connect('mongodb://localhost:27017').then(client => new MongoDBProvider(client, 'abot'))
).catch(console.error);

...
```

## License
MIT © [Paul Hobbel](https://github.com/paulhobbel)
