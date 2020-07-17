// Functions that run automatically
let settings;

// injects automatic scripts if enabled
if (!settings) {
	browser.storage.local.get(['automatic', 'automaticsettings']).then(data => {
		settings = data;

		if (settings) {
			Object.entries(data.automatic).filter(item => item[1] == true).forEach(fn => {
				browser.runtime.sendMessage({
					automatic: true,
					fn: fn[0],
					runAt: runtimes[fn[0]]
				});
			});
		}
	});
}

let runtimes = {
	loader: "document_start",
	minimap: "document_idle",
	linksInSameTab: "document_end"
}