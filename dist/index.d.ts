import { Guild } from 'discord.js';
import { CommandoClient, SettingProvider } from 'discord.js-commando';
import { MongoClient } from 'mongodb';
/**
 * Uses an MongoDB collection to store settings with guilds
 */
export default class MongoDBProvider extends SettingProvider {
    private mongoClient;
    /**
     * Database that will be used for storing/retrieving settings
     */
    private db;
    /**
     * Settings cached in memory, mapped by guild ID (or 'global')
     */
    private settings;
    /**
     * Listeners on the client, mapped by the event name
     */
    private listeners;
    /**
     * Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider})
     */
    private client?;
    /**
     * @param client - Database for the provider
     * @param dbName - The database name
     */
    constructor(client: MongoClient, dbName: string);
    init(client: CommandoClient): Promise<void>;
    destroy(): Promise<void>;
    get(guild: Guild, key: string, defVal: any): any;
    set(guild: Guild, key: string, val: any): Promise<any>;
    remove(guild: Guild, key: string): Promise<any>;
    clear(guild: string | Guild): Promise<void>;
    updateGuild(guild: string | number, settings: any): Promise<void>;
    /**
     * Loads all settings for a guild
     * @param guild - Guild ID to load the settings of (or 'global')
     * @param settings - Settings to load
     */
    private setupGuild;
    /**
     * Sets up a command's status in a guild from the guild's settings
     * @param guild		- Guild to set the status in
     * @param command	- Command to set the status of
     * @param settings	- Settings of the guild
     */
    private setupGuildCommand;
    /**
     * Sets up a group's status in a guild from the guild's settings
     * @param guild		- Guild to set the status in
     * @param group		- Group to set the status of
     * @param settings	- Settings of the guild
     */
    private setupGuildGroup;
    /**
     * Updates a global setting on all other shards if using the {@link ShardingManager}.
     * @param key - Key of the setting to update
     * @param val - Value of the setting
     */
    private updateOtherShards;
}
