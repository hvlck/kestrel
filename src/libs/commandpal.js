// CommandPal - Powers command processor
class CommandPal {
	constructor(source, options) {
		this.source = source; // JSON file with commands

		this.matchedCommands = {
			_oldCommands: this.commands,
			commands: [],

			changed: function () {
				if (this._oldCommands != this.commands) { return true }
				else { return false }
			},

			reset: function () {
				this._oldCommands = this.commands;
				this.commands = [];
				return this.commands;
			},

			sort: type => {
				if (type == 'alphabetical') {
					this.matchedCommands.commands.sort((a, b) => {
						if (a.localeCompare(b) > b.localeCompare(a)) { return 1 }
						else if (a.localeCompare(b) < b.localeCompare(a)) { return -1 }
					});
				} else if (type == 'reverse-alphabetical') {
					this.matchedCommands.commands.sort((a, b) => {
						if (a.localeCompare(b) > b.localeCompare(a)) { return -1 }
						else if (a.localeCompare(b) < b.localeCompare(a)) { return 1 }
					});
				} else if (type == 'rank' || type == 'reverse-rank') {
					this.matchedCommands.ranks = [];
					this.matchedCommands.commands.forEach((item, index) => {
						this.matchedCommands.ranks[index] = {};
						this.matchedCommands.ranks[index].name = item;
					}); // Populates ranks with names of currently matched commands

					Object.values(this.commands).forEach(item => {
						Object.values(this.matchedCommands.ranks).forEach((arrItem, index) => {
							if (item.name == arrItem.name) { this.matchedCommands.ranks[index].rank = item.rank || 0 }
							if (item.aliases) {
								item.aliases.forEach(alias => {
									if (alias == arrItem.name) { this.matchedCommands.ranks[index].rank = item.rank || 0 }
								});
							};
						});
					}); // Populates matched commands with ranks

					if (type == 'rank') {
						this.matchedCommands.ranks.sort((a, b) => parseFloat(b.rank) - parseFloat(a.rank)); // Sorts objects by rank
					} else if (type == 'reverse-rank') {
						this.matchedCommands.ranks.sort((a, b) => parseFloat(a.rank) - parseFloat(b.rank)); // Sorts objects by rank
					}

					this.matchedCommands.commands = this.matchedCommands.ranks.map(item => item.name);
				} else { this._generateError('', 'Invalid sorting pattern.') };
			}
		};

		this.rankings = {
			getRanking: command => {
				if (!command) { this._generateError('', 'No command specified when calling rankings.getRanking().') }
				else { return this.commands[command].rank || 0 }
			},

			resetRanking: command => {
				if (!command) { this._generateError('', 'No command specified when calling rankings.resetRanking().') }
				else {
					this.commands[command] = Object.assign(this.commands[command], { rank: 0 });
					return this.commands[command];
				}
			},

			reset: () => {
				Object.keys(this.commands).forEach(item => this.commands[item].rank = 0);
			}
		}

		this.commands = {}; // Raw commands from command source

		const defaults = {
			case: false,
			dev: false,
			exact: false,
			ranking: false,
			sort: false
		};

		this.options = { // Developer-set options
			items: Object.assign({
				case: false,
				dev: false,
				exact: false,
				ranking: false,
				sort: false
			}, options), // Default settings as fallback, also assigned to fill in settings gap

			reset: function (...items) { // Removes options key/value
				if (items.length === 0) { this._generateError('', 'No item specified when calling options.remove().') }
				else {
					return items.map(item => {
						this.items[item] = defaults[item];
						return this.items[item];
					});
				} // Return array of rest items with new change
			},

			update: function (items) {
				if (!items) { this._generateError('', 'No item(s) specified when calling options.update().') }
				else {
					this.items = Object.assign(this.items, items);
					return this.items;
				}
			}
		}

		this._fetchCommands();
	}

	updateCommand(...args) { // Updates specified command
		if (args.length === 0) { this._generateError('', 'No specified command when calling method updateCommand().') }
		args.forEach(arg => this.commands[Object.keys(arg)[0]] = Object.values(arg)[0]);
	}

	removeCommand(...args) { // Removes specified commands
		if (args.length === 0) { this._generateError('', `No specified command when calling method removeCommand().`) }
		else {
			args.forEach(arg => {
				if (this.commands[arg]) {
					delete this.commands[arg];
				} else {
					Object.keys(this.commands).forEach(command => {
						if (this.commands[command].name == arg) {
							delete this.commands[command];
						}
					})
				}
			});
		}
	}

	_fetchCommands() { // Assigns/Fetches list of commands
		if (typeof this.source == 'string' && this.source.endsWith('.json')) {
			fetch(this.source).then(res => { return res.json() }).then(data => { // Fetches commands from JSON file and inputs them into various variables
				this.commands = Object.assign(this.commands, data);
			}).catch(err => { this._generateError(err, `Failed to load commands from source ${this.source}.`) });
		} else {
			this.commands = Object.assign(this.commands, this.source)
		}
	}

	updateCommandList(source) { // Updates list of commands
		if (source == this.source) { return false }
		else {
			this.source = source;
			this._fetchCommands();
		}
	}

	listen(value) { // Listens for user input to return matching commands
		this.matchedCommands.reset(); // Resets matchedCommands

		if (this.options.items.case === false) { value = value.toLowerCase() }
		Object.keys(this.commands).forEach(command => {
			if (this.commands[command].aliases) {
				this.commands[command].aliases.forEach((alias, index) => { // Matching based on various options
					if (this.options.items.case === false) {
						if (this.options.items.exact === true) {
							if (this.commands[command].aliases[index].toLowerCase().startsWith(value)) {
								this.matchedCommands.commands.push(this.commands[command].aliases[index]);
							}
						} else {
							if (this.commands[command].aliases[index].toLowerCase().includes(value)) {
								this.matchedCommands.commands.push(this.commands[command].aliases[index]);
							}
						}
					} else {
						if (this.options.items.exact === true) {
							if (this.commands[command].aliases[index].startsWith(value)) {
								this.matchedCommands.commands.push(this.commands[command].aliases[index]);
							}
						} else {
							if (this.commands[command].aliases[index].includes(value)) {
								this.matchedCommands.commands.push(this.commands[command].aliases[index]);
							}
						}
					}
				});
			}

			if (this.options.items.case === false) {
				if (this.options.items.exact === true) {
					if (this.commands[command].name.toLowerCase().startsWith(value)) {
						this.matchedCommands.commands.push(this.commands[command].name);
					}
				}
				if (this.commands[command].name.toLowerCase().includes(value)) {
					this.matchedCommands.commands.push(this.commands[command].name);
				}
			} else {
				if (this.options.items.exact === true) {
					if (this.commands[command].name.startsWith(value)) {
						this.matchedCommands.commands.push(this.commands[command].name);
					}
				} else {
					if (this.commands[command].name.includes(value)) {
						this.matchedCommands.commands.push(this.commands[command].name);
					}
				}
			}
		});

		if (this.options.items.sort) { this.matchedCommands.sort(this.options.items.sort) };

		return this.matchedCommands.commands;
	};

	execute(command, obj) { // Executes given command from one of its values (e.g. description, name, function name, etc.)
		let callback;
		Object.values(this.commands).forEach(item => {
			if (item.name == command) {
				if (this.options.items.ranking) { // Updates command's rank
					if (!item.rank) { item.rank = 1 }
					else if (item.rank >= 1) { item.rank += 1 };
				}
				callback = item.callback;
			} else if (item.aliases) {
				item.aliases.forEach(alias => { // Checks aliases to see if they match command
					if (alias == command) {
						callback = item.callback;
						if (this.options.items.ranking) { // Updates command's rank
							if (!item.rank) { item.rank = 1 }
							else if (item.rank >= 1) { item.rank += 1 };
						}
					}
				});
			}
		});
		if (!obj) { obj = window }
		obj[callback](command);
	};

	_generateError(error, msg) { // Developer mode erorr reporting
		console.error(`CommandPal error${this.options.items.dev ? `: ${msg}` : '.'}${error ? `  Error: ${error}` : ''}`);
	};
}
