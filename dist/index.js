"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_commando_1 = require("discord.js-commando");
/**
 * Uses an MongoDB collection to store settings with guilds
 */
var MongoDBProvider = /** @class */ (function (_super) {
    __extends(MongoDBProvider, _super);
    /**
     * @param client - Database for the provider
     * @param dbName - The database name
     */
    function MongoDBProvider(client, dbName) {
        var _this = _super.call(this) || this;
        /**
         * Settings cached in memory, mapped by guild ID (or 'global')
         */
        _this.settings = new Map();
        /**
         * Listeners on the client, mapped by the event name
         */
        _this.listeners = new Map();
        _this.mongoClient = client;
        _this.db = client.db(dbName);
        return _this;
    }
    MongoDBProvider.prototype.init = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, _a, _b, _c, event_1, listener;
            var e_1, _d;
            var _this = this;
            return __generator(this, function (_e) {
                this.client = client;
                collection = this.db.collection('settings');
                // Load all settings
                collection.find().forEach(function (doc) {
                    var guild = doc.guild !== '0' ? doc.guild : 'global';
                    _this.settings.set(guild, doc.settings);
                    // Guild is not global, and doesn't exist currently so lets skip it.
                    if (guild !== 'global' && !client.guilds.cache.has(doc.guild))
                        return;
                    _this.setupGuild(guild, doc.settings);
                });
                // Listen for changes
                this.listeners
                    .set('commandPrefixChange', function (guild, prefix) { return _this.set(guild, 'prefix', prefix); })
                    .set('commandStatusChange', function (guild, command, enabled) { return _this.set(guild, "cmd-" + command.name, enabled); })
                    .set('groupStatusChange', function (guild, group, enabled) { return _this.set(guild, "grp-" + group.id, enabled); })
                    .set('guildCreate', function (guild) {
                    var settings = _this.settings.get(guild.id);
                    if (!settings)
                        return;
                    _this.setupGuild(guild.id, settings);
                })
                    .set('commandRegister', function (command) {
                    var e_2, _a;
                    try {
                        for (var _b = __values(_this.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var _d = __read(_c.value, 2), guild = _d[0], settings = _d[1];
                            if (guild !== 'global' && !client.guilds.cache.has(guild))
                                continue;
                            _this.setupGuildCommand(client.guilds.cache.get(guild), command, settings);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                })
                    .set('groupRegister', function (group) {
                    var e_3, _a;
                    try {
                        for (var _b = __values(_this.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var _d = __read(_c.value, 2), guild = _d[0], settings = _d[1];
                            if (guild !== 'global' && !client.guilds.cache.has(guild))
                                continue;
                            _this.setupGuildGroup(client.guilds.cache.get(guild), group, settings);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                });
                try {
                    for (_a = __values(this.listeners), _b = _a.next(); !_b.done; _b = _a.next()) {
                        _c = __read(_b.value, 2), event_1 = _c[0], listener = _c[1];
                        client.on(event_1, listener);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBProvider.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, event_2, listener;
            var e_4, _d;
            return __generator(this, function (_e) {
                // Close database connection
                this.mongoClient.close();
                try {
                    // Remove all listeners from the client
                    for (_a = __values(this.listeners), _b = _a.next(); !_b.done; _b = _a.next()) {
                        _c = __read(_b.value, 2), event_2 = _c[0], listener = _c[1];
                        this.client.removeListener(event_2, listener);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                this.listeners.clear();
                return [2 /*return*/];
            });
        });
    };
    MongoDBProvider.prototype.get = function (guild, key, defVal) {
        var settings = this.settings.get(discord_js_commando_1.SettingProvider.getGuildID(guild));
        return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defVal : defVal;
    };
    MongoDBProvider.prototype.set = function (guild, key, val) {
        return __awaiter(this, void 0, void 0, function () {
            var guildId, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guildId = discord_js_commando_1.SettingProvider.getGuildID(guild);
                        settings = this.settings.get(guildId);
                        if (!settings) {
                            settings = {};
                            this.settings.set(guildId, settings);
                        }
                        settings[key] = val;
                        return [4 /*yield*/, this.updateGuild(guildId, settings)];
                    case 1:
                        _a.sent();
                        if (guildId === 'global')
                            this.updateOtherShards(key, val);
                        return [2 /*return*/, val];
                }
            });
        });
    };
    MongoDBProvider.prototype.remove = function (guild, key) {
        return __awaiter(this, void 0, void 0, function () {
            var guildId, settings, val;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guildId = discord_js_commando_1.SettingProvider.getGuildID(guild);
                        settings = this.settings.get(guildId);
                        if (!settings || typeof settings[key] === 'undefined')
                            return [2 /*return*/];
                        val = settings[key];
                        delete settings[key]; // NOTE: I know this isn't efficient, but it does the job.
                        return [4 /*yield*/, this.updateGuild(guildId, settings)];
                    case 1:
                        _a.sent();
                        if (guildId === 'global')
                            this.updateOtherShards(key, undefined);
                        return [2 /*return*/, val];
                }
            });
        });
    };
    MongoDBProvider.prototype.clear = function (guild) {
        return __awaiter(this, void 0, void 0, function () {
            var guildId, collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guildId = discord_js_commando_1.SettingProvider.getGuildID(guild);
                        if (!this.settings.has(guildId))
                            return [2 /*return*/];
                        this.settings.delete(guildId);
                        collection = this.db.collection('settings');
                        return [4 /*yield*/, collection.deleteOne({ guild: guildId !== 'global' ? guildId : 0 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoDBProvider.prototype.updateGuild = function (guild, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guild = guild !== 'global' ? guild : 0;
                        collection = this.db.collection('settings');
                        return [4 /*yield*/, collection.updateOne({ guild: guild }, { $set: { guild: guild, settings: settings } }, { upsert: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loads all settings for a guild
     * @param guild - Guild ID to load the settings of (or 'global')
     * @param settings - Settings to load
     */
    MongoDBProvider.prototype.setupGuild = function (guildId, settings) {
        var e_5, _a, e_6, _b;
        if (typeof guildId !== 'string')
            throw new TypeError('The guild must be a guild ID or "global".');
        var guild = this.client.guilds.cache.get(guildId) || null;
        // Load the command prefix
        if (typeof settings.prefix !== 'undefined') {
            if (guild)
                guild.commandPrefix = settings.prefix;
            else
                this.client.commandPrefix = settings.prefix;
        }
        try {
            // Load all command/group statuses
            for (var _c = __values(this.client.registry.commands.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var command = _d.value;
                this.setupGuildCommand(guild, command, settings);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        try {
            for (var _e = __values(this.client.registry.groups.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                var group = _f.value;
                this.setupGuildGroup(guild, group, settings);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    /**
     * Sets up a command's status in a guild from the guild's settings
     * @param guild		- Guild to set the status in
     * @param command	- Command to set the status of
     * @param settings	- Settings of the guild
     */
    MongoDBProvider.prototype.setupGuildCommand = function (guild, command, settings) {
        if (typeof settings["cmd-" + command.name] === 'undefined')
            return;
        command.setEnabledIn(guild, settings["cmd-" + command.name]);
    };
    /**
     * Sets up a group's status in a guild from the guild's settings
     * @param guild		- Guild to set the status in
     * @param group		- Group to set the status of
     * @param settings	- Settings of the guild
     */
    MongoDBProvider.prototype.setupGuildGroup = function (guild, group, settings) {
        if (typeof settings["grp-" + group.id] === 'undefined')
            return;
        group.setEnabledIn(guild, settings["grp-" + group.id]);
    };
    /**
     * Updates a global setting on all other shards if using the {@link ShardingManager}.
     * @param key - Key of the setting to update
     * @param val - Value of the setting
     */
    MongoDBProvider.prototype.updateOtherShards = function (key, val) {
        if (!this.client.shard)
            return;
        key = JSON.stringify(key);
        val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
        this.client.shard.broadcastEval("\n\t\t\tconst ids = [" + this.client.shard.ids.join(',') + "];\n\t\t\tif(!this.shard.ids.some(id => ids.includes(id)) && this.provider && this.provider.settings) {\n\t\t\t\tlet global = this.provider.settings.get('global');\n\t\t\t\tif(!global) {\n\t\t\t\t\tglobal = {};\n\t\t\t\t\tthis.provider.settings.set('global', global);\n\t\t\t\t}\n\t\t\t\tglobal[" + key + "] = " + val + ";\n\t\t\t}\n\t\t");
    };
    return MongoDBProvider;
}(discord_js_commando_1.SettingProvider));
exports.default = MongoDBProvider;
