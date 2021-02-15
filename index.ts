import { Guild } from 'discord.js';
import { Command, CommandGroup, CommandoClient, SettingProvider, CommandoGuild } from 'discord.js-commando';
import { Db, MongoClient } from 'mongodb';

/**
 * Uses an MongoDB collection to store settings with guilds
 */
export class MongoDBProvider extends SettingProvider {

	private mongoClient: MongoClient;

	/**
	 * Database that will be used for storing/retrieving settings
	 */
	private db: Db;

	/**
	 * Settings cached in memory, mapped by guild ID (or 'global')
	 */
	private settings = new Map<string, any>();

	/**
	 * Listeners on the client, mapped by the event name
	 */
	private listeners = new Map<any, any>();

	/**
	 * Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider})
	 */
	private client?: CommandoClient;

	/**
	 * @param client - Database for the provider
	 * @param dbName - The database name
	 */
	constructor(client: MongoClient, dbName: string) {
		super();
		this.mongoClient = client;
		this.db = client.db(dbName);
	}

	async init(client: CommandoClient) {
		this.client = client;
        
        // Load or create the settings collection
        const collection = this.db.collection('settings');
        
        // Load all settings
        collection.find().forEach(doc => {
            const guild = doc.guild !== '0' ? doc.guild : 'global';
            this.settings.set(guild, doc.settings);

            // Guild is not global, and doesn't exist currently so lets skip it.
            if(guild !== 'global' && !client.guilds.cache.has(doc.guild)) return;

            this.setupGuild(guild, doc.settings);
        });

		// Listen for changes
		this.listeners
			.set('commandPrefixChange', (guild: Guild, prefix: string) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild: Guild, command: Command, enabled: boolean) => this.set(guild, `cmd-${command.name}`, enabled))
			.set('groupStatusChange', (guild: Guild, group: CommandGroup, enabled: boolean) => this.set(guild, `grp-${group.id}`, enabled))
			.set('guildCreate', (guild: Guild) => {
				const settings = this.settings.get(guild.id);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			})
			.set('commandRegister', (command: Command) => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.cache.has(guild)) continue;
					this.setupGuildCommand(client.guilds.cache.get(guild) as CommandoGuild, command, settings);
				}
			})
			.set('groupRegister', (group: CommandGroup) => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.cache.has(guild)) continue;
					this.setupGuildGroup(client.guilds.cache.get(guild) as CommandoGuild, group, settings);
				}
			});
		for(const [event, listener] of this.listeners) client.on(event, listener);
	}

	async destroy() {
		// Close database connection
		this.mongoClient.close();

		// Remove all listeners from the client
		for(const [event, listener] of this.listeners) this.client!.removeListener(event, listener);
		this.listeners.clear();
	}

	get(guild: Guild, key: string, defVal: any) {
		const settings = this.settings.get(SettingProvider.getGuildID(guild));
		return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defVal : defVal;
	}

	async set(guild: Guild, key: string, val: any) {
		const guildId = SettingProvider.getGuildID(guild);
		let settings = this.settings.get(guildId);
		if(!settings) {
			settings = {};
			this.settings.set(guildId, settings);
		}

        settings[key] = val;
        
        await this.updateGuild(guildId, settings);

		if(guildId === 'global') this.updateOtherShards(key, val);
		return val;
	}

	async remove(guild: Guild, key: string) {
		const guildId = SettingProvider.getGuildID(guild);
		const settings = this.settings.get(guildId);
		if(!settings || typeof settings[key] === 'undefined') return;

		const val = settings[key];
        delete settings[key]; // NOTE: I know this isn't efficient, but it does the job.

        await this.updateGuild(guildId, settings);

		if(guildId === 'global') this.updateOtherShards(key, undefined);
		return val;
	}

	async clear(guild: string | Guild) {
		const guildId = SettingProvider.getGuildID(guild);
		if(!this.settings.has(guildId)) return;
        this.settings.delete(guildId);
        
        const collection = this.db.collection('settings');
        await collection.deleteOne({ guild: guildId !== 'global' ? guildId : 0 });
    }
    
    async updateGuild(guild: string | number, settings: any) {
        guild = guild !== 'global' ? guild : 0;

        const collection = this.db.collection('settings');
        await collection.updateOne({ guild }, { $set: { guild, settings } }, { upsert: true });
    }

	/**
	 * Loads all settings for a guild
	 * @param guild - Guild ID to load the settings of (or 'global')
	 * @param settings - Settings to load
	 */
	private setupGuild(guildId: string, settings: any) {
		if(typeof guildId !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
		const guild = this.client!.guilds.cache.get(guildId) as CommandoGuild || null;

		// Load the command prefix
		if(typeof settings.prefix !== 'undefined') {
			if(guild) guild.commandPrefix = settings.prefix;
			else this.client!.commandPrefix = settings.prefix;
		}

		// Load all command/group statuses
		for(const command of this.client!.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
		for(const group of this.client!.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
	}

	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param guild		- Guild to set the status in
	 * @param command	- Command to set the status of
	 * @param settings	- Settings of the guild
	 */
	private setupGuildCommand(guild: CommandoGuild, command: Command, settings: any) {
		if(typeof settings[`cmd-${command.name}`] === 'undefined') return;

		command.setEnabledIn(guild, settings[`cmd-${command.name}`]);
	}

	/**
	 * Sets up a group's status in a guild from the guild's settings
	 * @param guild		- Guild to set the status in
	 * @param group		- Group to set the status of
	 * @param settings	- Settings of the guild
	 */
	private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: any) {
		if(typeof settings[`grp-${group.id}`] === 'undefined') return;

		group.setEnabledIn(guild, settings[`grp-${group.id}`]);
	}

	/**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param key - Key of the setting to update
	 * @param val - Value of the setting
	 */
	private updateOtherShards(key: string, val: any) {
		if(!this.client!.shard) return;
		key = JSON.stringify(key);
		val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
		this.client!.shard.broadcastEval(`
			const ids = [${this.client!.shard.ids.join(',')}];
			if(!this.shard.ids.some(id => ids.includes(id)) && this.provider && this.provider.settings) {
				let global = this.provider.settings.get('global');
				if(!global) {
					global = {};
					this.provider.settings.set('global', global);
				}
				global[${key}] = ${val};
			}
		`);
	}
}