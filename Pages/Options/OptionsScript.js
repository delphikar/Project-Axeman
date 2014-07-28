$(document).ready(function () {
	// Go through all plugins in global list and add them to the page
	$.each(GlobalPluginsList, function (index, obj) {
		// Skip internal plugins if not in development mode
		if (obj.Flags.Internal && !IsDevelopmentMode) {
			console.warn("PluginsManagerPage: Internal plugin [" + obj.Name + "] ");
			return true;
		}

		// Append plugin item element and add actions to it
		DrawTable(obj);
		ActionTable(obj);

		return true;
	});

	// Google Analytics
	if (!IsDevelopmentMode) {
		// Initialize GA
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-33221456-3']);
		_gaq.push(['_trackPageview']);

		(function () {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = 'https://ssl.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	}
});

function DrawTable(obj) {
};

function ActionTable(obj) {
};