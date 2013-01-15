$(document).ready(function () {
	(new StorageDetails()).Initialize();

	// Google analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-33221456-3']);
	_gaq.push(['_trackPageview']);

	(function () {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
});

function StorageDetails() {
	this.Initialize = function () {
		// Clears localStorage and reloads page
		$("#ClearLocalStorage").click(function () { localStorage.clear(); location.reload(); });

		if (localStorage.length != 0) {
			// Hides No Data sign
			$("#NoDataSign").attr("style", "visibility:hidden;");

			var root = $("#LocalStorageTree");
			// Populates browser
			for (var index = 0; index < localStorage.length; ++index) {
				var item = $("<li></li>");
				item.append("<span>" + localStorage.key(index) + ":</span>");
				item.append(dump(JSON.parse(localStorage[localStorage.key(index)]), true));

				root.append(item);
			}
			
			// Assign click to Table header
			$(".PASDTableHeader").click(function() {
				$("tr", $(this).parent().parent().parent()).each(function (index) {
					if (index > 0) {
						$(this).toggle();
					}
				});
			});
		}
	};
};

// Class: Dump
// Author: Shuns (www.netgrow.com.au/files)
// Implemented to Project Axeman by
//	kavillock
// Last Updated: 25.11.2012.
// Version: 1.1.2
// TODO Comment
// TODO Refactor
// TODO Log
// TODO Change style
function dump(object, showTypes) {
	var dump = '';
	var st = typeof showTypes == 'undefined' ? true : showTypes;
	dump += (/string|number|undefined|boolean/.test(typeof(object)) || object == null) ? object : recurse(object, typeof object);

	return dump;

	function recurse(o, type) {
		var i;
		var j = 0;
		var r = '';
		type = _dumpType(o);
		switch (type) {		
			case 'regexp':
				var t = type;
				r += '<table' + _dumpStyles(t,'table') + '><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
				r += '<tr><td colspan="2"' + _dumpStyles(t,'td-value') + '><table' + _dumpStyles('arguments','table') + '><tr><td' + _dumpStyles('arguments','td-key') + '><i>RegExp: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';  
				j++;
				break;
			case 'date':
				var t = type;
				r += '<table' + _dumpStyles(t,'table') + '><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
				r += '<tr><td colspan="2"' + _dumpStyles(t,'td-value') + '><table' + _dumpStyles('arguments','table') + '><tr><td' + _dumpStyles('arguments','td-key') + '><i>Date: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';  
				j++;
				break;
			case 'function':
				var t = type;
				var a = o.toString().match(/^.*function.*?\((.*?)\)/im); 
				var args = (a == null || typeof a[1] == 'undefined' || a[1] == '') ? 'none' : a[1];
				r += '<table' + _dumpStyles(t,'table') + '><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
				r += '<tr><td colspan="2"' + _dumpStyles(t,'td-value') + '><table' + _dumpStyles('arguments','table') + '><tr><td' + _dumpStyles('arguments','td-key') + '><i>Arguments: </i></td><td' + _dumpStyles(type,'td-value') + '>' + args + '</td></tr><tr><td' + _dumpStyles('arguments','td-key') + '><i>Function: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';  
				j++;
				break;
			case 'domelement':
				var t = type;
				r += '<table' + _dumpStyles(t,'table') + '><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
				r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>Node Name: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.nodeName.toLowerCase() + '</td></tr>';  
				r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>Node Type: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.nodeType + '</td></tr>'; 
				r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>Node Value: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.nodeValue + '</td></tr>'; 					
				r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>innerHTML: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.innerHTML + '</td></tr>';  
				j++;
				break;		
		}
		if (/object|array/.test(type)) {
			for (i in o) {
				var t = _dumpType(o[i]);
				if (j < 1) {
					var info = '';
					if (type == "array")
						info = ' (' + o.length + ')';
					r += '<table' + _dumpStyles(type,'table') + '><tr><th colspan="2"' + _dumpStyles(type,'th') + '><div class="PASDTableHeader">' + type + info + '</div></th></tr>';
					j++;	  
				}
				if (typeof o[i] == 'object' && o[i] != null) { 
					r += '<tr><td' + _dumpStyles(type,'td-key') + '>' + i + (st ? ' [' + t + ']' : '') + '</td><td' + _dumpStyles(type,'td-value') + '>' + recurse(o[i], t) + '</td></tr>';	
				} else if (typeof o[i] == 'function') {
					r += '<tr><td' + _dumpStyles(type ,'td-key') + '>' + i + (st ? ' [' + t + ']' : '') + '</td><td' + _dumpStyles(type,'td-value') + '>' + recurse(o[i], t) + '</td></tr>';  	
				} else {
					r += '<tr><td' + _dumpStyles(type,'td-key') + '>' + i + (st ? ' [' + t + ']' : '') + '</td><td' + _dumpStyles(type,'td-value') + '>' + o[i] + '</td></tr>';  
				}
			}
		}
		if (j == 0) {
		r += '<table' + _dumpStyles(type,'table') + '><tr><th colspan="2"' + _dumpStyles(type,'th') + '>' + type + ' [empty]</th></tr>'; 	
		}
		r += '</table>';
		return r;
	};	
};

_dumpStyles = function(type, use) {
	var r = '';
	var table = 'font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;cell-spacing:2px;';
	var th = 'font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;text-align:left;color: white;padding: 5px;vertical-align :top;';
	var td = 'font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;vertical-align:top;padding:3px;';
	switch (type) {
		case 'string':
		case 'number':
		case 'boolean':
		case 'undefined':
		case 'object':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#333;width:100%;"';
				break;
				case 'th':
					r = ' style="' + th + 'background:#444;"';
				break;
				case 'td-key':
					r = ' style="' + td + 'background:#E5E5E5;"';
				break;
				case 'td-value':
					r = ' style="' + td + 'background:#fff;"';
				break;
			}
		break;
		case 'array':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#888; width:100%;"';
				break;
				case 'th':
					r = ' style="' + th + 'background:#999;"';
				break;
				case 'td-key':
					r = ' style="' + td + 'background:#F3F3F3;"';
				break;
				case 'td-value':
					r = ' style="' + td + 'background:#fff;"';
				break;
			}	
		break;
		case 'function':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#aa4400;width:100%;"';
				break;
				case 'th':
					r = ' style="' + th + 'background:#cc6600;"';
				break;
				case 'td-key':
					r = ' style="' + td + 'background:#fff;"';
				break;
				case 'td-value':
					r = ' style="' + td + 'background:#fff;"';
				break;
			}	
		break;
		case 'arguments':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#dddddd;cell-spacing:3;width:100%;"';
				break;
				case 'td-key':
					r = ' style="' + th + 'background:#eeeeee; color:#000000;"';
				break;	  
			}	
		break;
		case 'regexp':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#CC0000;cell-spacing:3;width:100%;"';
				break;
				case 'th':
					r = ' style="' + th + 'background:#FF0000;"';
				break;
				case 'td-key':
					r = ' style="' + th + 'background:#FF5757;color:#000000;"';
				break;
				case 'td-value':
					r = ' style="' + td + 'background:#fff;"';
				break;		  
			}	
		break;
		case 'date':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#663399;cell-spacing:3;width:100%;"';
				break;
				case 'th':
					r = ' style="' + th + 'background:#9966CC;"';
				break;
				case 'td-key':
					r = ' style="' + th + 'background:#B266FF;color:#000000;"';
				break;
				case 'td-value':
					r = ' style="' + td + 'background:#fff;"';
				break;		  
			}	
		break;
		case 'domelement':
			switch (use) {
				case 'table':  
					r = ' style="' + table + 'background:#FFCC33;cell-spacing:3;width:100%;"';
				break;
				case 'th':
					r = ' style="' + th + 'background:#FFD966;"';
				break;
				case 'td-key':
					r = ' style="' + th + 'background:#FFF2CC;color:#000000;"';
				break;
				case 'td-value':
					r = ' style="' + td + 'background:#fff;"';
				break;		  
			}	
		break;	  
	}
	return r;
};

_dumpType = function (obj) {
	var t = typeof(obj);
		if (t == 'function') {
			var f = obj.toString();
		if ( ( /^\/.*\/[gi]??[gi]??$/ ).test(f)) {
			return 'regexp';
		} else if ((/^\[object.*\]$/i ).test(f)) {
			t = 'object'
		}
	}
	if (t != 'object') {
		return t;
	}
	switch (obj) {
		case null:
			return 'null';
		case window:
			return 'window';
		case document:
			return document;
		case window.event:
			return 'event';
	}
	if (window.event && (event.type == obj.type)) {
		return 'event';
	}
	var c = obj.constructor;
	if (c != null) {
		switch(c) {
			case Array:
				t = 'array';
			break;
			case Date:
				return 'date';
			case RegExp:
				return 'regexp';
			case Object:
				t = 'object';	
			break;
			case ReferenceError:
				return 'error';
			default:
				var sc = c.toString();
				var m = sc.match(/\s*function (.*)\(/);
				if(m != null) {
					return 'object';
				}
		}
	}
	var nt = obj.nodeType;
	if (nt != null) {
		switch(nt) {
			case 1:
				if(obj.item == null) {
					return 'domelement';
				}
			break;
			case 3:
				return 'string';
		}
	}
	if (obj.toString != null) {
		var ex = obj.toString();
		var am = ex.match(/^\[object (.*)\]$/i);
		if(am != null) {
			var am = am[1];
			switch(am.toLowerCase()) {
				case 'event':
					return 'event';
				case 'nodelist':
				case 'htmlcollection':
				case 'elementarray':
					return 'array';
				case 'htmldocument':
					return 'htmldocument';
			}
		}
	}
	return t;
};