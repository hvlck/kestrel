// Command palette processor
let commands = {
	"openSettings": {
		"name": "Settings",
		"callback": "openSettings"
	},
	"toggleMiniMap": {
		"name": "Toggle minimap",
		"callback": "toggleMiniMap"
	},
	"toggleEditPage": {
		"name": "Toggle Edit Page",
		"callback": "editPage"
	},
	"disableLinks": {
		"name": "Disable all links",
		"callback": "disableLinks"
	}
};

class CommandPal {
	constructor(options) {
		this.file = commands; // Commands variable or JSON file

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
			},

			sort: function (type) {
				if (type == 'alphabetical') {
					this.commands.sort((a, b) => {
						if (a.localeCompare(b) > b.localeCompare(a)) { return 1 }
						else if (a.localeCompare(b) < b.localeCompare(a)) { return -1 }
					});
				}
			}
		};

		this.commands = {}; // Raw commands from command source

		this.options = { // Developer-set options
			items: Object.assign({
				case: false, // Default settings as fallback, also assigned to fill in settings gap
				dev: false,
				sort: false
			}, options), // Options object

			remove: function (item) { // Removes options key/value
				delete this.items[item];
			},

			update: function (item) {
				this.items = Object.assign(this.items, item);
			}
		}

		this.getCommands();
	}

	insertCommand(...args) {
		args.forEach(arg => this.commands[Object.keys(arg)[0]] = Object.values(arg)[0]);
	}

	removeCommand(...args) {
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
		})
	}

	getCommands() {
		this.commands = Object.assign(this.commands, this.file);
	}

	updateCommands(file) {
		if (file == this.file) { return false }
		else {
			this.file = file;
			this.getCommands();
		}
	}

	listen(value) { // Listens for user input to return matching commands
		this.matchedCommands.reset();

		if (this.options.items.case === false) { value = value.toLowerCase() }
		Object.keys(this.commands).forEach(command => {
			if (this.commands[command].aliases) {
				this.commands[command].aliases.forEach((alias, index) => {
					if (this.options.items.case === false) {
						if (this.commands[command].aliases[index].toLowerCase().includes(value)) {
							this.matchedCommands.commands.push(this.commands[command].aliases[index]);
						}
					} else {
						if (this.commands[command].aliases[index].includes(value)) {
							this.matchedCommands.commands.push(this.commands[command].aliases[index]);
						}
					}
				});
			}

			if (this.options.items.case === false) {
				if (this.commands[command].name.toLowerCase().includes(value)) {
					this.matchedCommands.commands.push(this.commands[command].name);
				}
			} else {
				if (this.commands[command].name.includes(value)) {
					this.matchedCommands.commands.push(this.commands[command].name);
				}
			}
		});

		if (this.options.items.sort) { this.matchedCommands.sort(this.options.items.sort) };
	};

	execute(command, obj) { // Executes given command from one of its values (e.g. description, name, function name, etc.)
		let callback;
		if (typeof command == 'function') {
			command();
		} else {
			Object.values(this.commands).forEach(item => {
				if (item.name == command) {
					callback = item.callback;
				} else {
					if (item.aliases) {
						item.aliases.forEach(alias => {
							if (alias == command) {
								callback = item.callback;
							}
						});
					}
				}
			});
			if (!obj) { obj = window }
			obj[callback](command);
		}
	};

	_generateError(error, msg) { // Developer mode erorr reporting
		console.error(`CommandPal failure${this.options.items.dev ? `: ${msg}` : '.'}  Error: ${error}.`);
	};
}
