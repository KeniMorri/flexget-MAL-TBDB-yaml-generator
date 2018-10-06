

var Nightmare = require('nightmare');


var Log = require('./log.js');
Log.initBasicV2('./', 'Test');


//Horrible Subs Get Show List
/*
url : https://horriblesubs.info/current-season/

//Get List of elements
showlist = document.getElementsByClassName('shows-wrapper')[0].getElementsByTagName('a')

//Get List of titles from previous
var showlisttext = [];
for(var i = 0; showlist[i]; i++) {
	showlisttext.push(showlist[i].innerText)
}


*/


var previousAnimeLoaded = require('./loaded.json')
console.log(previousAnimeLoaded);

var cleanAnimeList = [];
var urlAnimeList = [];
var jpnAnimeList = [];
var jpnUrlAnimeList = [];
var animeID = [];
var newAnime = [];

var GUI;
var scafoldNightmare = function() {
	console.log('Scafolding nightmare');
	GUI = Nightmare({
		show: true,
		typeInterval: 20,
		alwaysOnTop: false,
		title: 'CXP Toolkit',
		x: 100,
		y: 10,
		icon: './Utility/icon.png',
		autoHideMenuBar: true
	})
	GUI
		.viewport(800, 1000)
		.goto('https://horriblesubs.info/current-season/')
		.wait('#main')
		.evaluate(function() {
			var showlist = document.getElementsByClassName('shows-wrapper')[0].getElementsByTagName('a');
			var showlisttext = [];
			for(var i = 0; showlist[i]; i++) {
				showlisttext.push(showlist[i].innerText)
			}
			return showlisttext;
		})
		.then(function(list) {
			console.log('Anime Titles');
			console.log(list);
			cleanAnimeList = list;
			Log.data('Clean Anime List', cleanAnimeList, true);

			//Below does a comparison between old searches with the newest search so we only search for new animes
			for(var i = 0; cleanAnimeList[i]; i++) {
				if(previousAnimeLoaded.find(function(element) 
					{ 
						var retVal = false;
						if(element == cleanAnimeList[i]) {
							//console.log('Previous:' + element + ' current:' + cleanAnimeList[i]);
							retVal = true;
						}
						return retVal;
					})
				) 
				{
					//console.log('OLD');
				}
				else {
					console.log('NEW');
					console.log(cleanAnimeList[i]);
					newAnime.push(cleanAnimeList[i])
				}
			}

			console.log('New Entries:');
			console.log(newAnime);
			for(var i = 0; newAnime[i]; i++) {
				urlAnimeList.push(encodeURI(newAnime[i]));
			}
			Log.data('URL Encoded', urlAnimeList, true);
			if(newAnime.length > 0) {
				malSearch(urlAnimeList);
			}
			else {
				console.log('No New Anime')
			}
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
		})
}
scafoldNightmare();

//Mal Get anime Japanese Titles
/*
url : https://myanimelist.net/

//Change search to anime only
select1 = document.getElementById('topSearchValue').value = 'anime'

Or do this instead

https://myanimelist.net/search/all?q=Naruto <- change the q
encode titles with: encodeURI('Jashin-chan Dropkick')

//Get Japanese title:

- get list of spans
list = document.getElementsByClassName('spaceit_pad')

- parse them all until you hit japanese

- find span that has japanese
list[0].getElementsByTagName('span')[0].innerText
- loop the above

//this will get the japanese title from mal

var i = 0;
while(i < 10) {
    if( list[i].innerText.search("Japanese") > -1) {
		console.log('What');
		console.log(list[i].innerText);
        break;
    }
i++;
}
if(i < 9) {
    console.log(list[i].innerText.split('Japanese: ')[1]);
}
console.log(i)
*/

var malSearch = function(icleanAnimeList) {
	console.log('>>>Mal Search');
	if(icleanAnimeList[0]) {
		console.log('Current Title:' + icleanAnimeList[0]);
		console.log('Current queue:' + icleanAnimeList.length);
		GUI
		.goto('https://myanimelist.net/search/all?q=' + icleanAnimeList[0])
		.wait('div#content')
		.once('did-finish-load', function() {
			console.log('finshed loading');
			return GUI
			.evaluate(function() {
				var list = document.getElementsByClassName('spaceit_pad')
				var i = 0;
				while(i < 10) {
					if( list[i].innerText.search("Japanese") > -1) {
						console.log('What');
						console.log(list[i].innerText);
						break;
					}
				i++;
				}
				if(i < 9) {
					console.log(list[i].innerText.split('Japanese: ')[1]);
				}
				console.log(i)
				return list[i].innerText.split('Japanese: ')[1];
			})
			.then(function(title) {
				console.log('Japanese Title');
				console.log(title);
				Log.statement(title, true);
				jpnAnimeList.push(title);

				icleanAnimeList.shift();
				malSearch(icleanAnimeList);
			})
		})
		.evaluate(function() {
			document.getElementsByTagName('article')[0].getElementsByTagName('div')[0].getElementsByTagName('div')[0].getElementsByTagName('a')[0].click();
		})
		.catch(function (error) {
			console.log(error);
		})
	}
	else {
		Log.data('Japanese Titles', jpnAnimeList, true);
		for(var i = 0; jpnAnimeList[i]; i++) {
			jpnUrlAnimeList.push(encodeURI(jpnAnimeList[i]));
		}
		Log.data('Encoded japanese titles', jpnUrlAnimeList, true);

		tvDBsearch(jpnUrlAnimeList);
	}
}


var tvDBsearch = function(ijpnUrlList) {
	console.log('>>>tvdb Search');
	if(ijpnUrlList[0]) {
		console.log('Current Title:' + ijpnUrlList[0]);
		console.log('Current queue:' + ijpnUrlList.length);
		
		GUI
		.goto('https://www.thetvdb.com/search?l=ja&q=' + ijpnUrlList[0])
		.wait('div.form-group')
		.exists('table.table.table-hover')
		.then(function(exists) {
			if(exists) {
				console.log('It exists');
				GUI
					.evaluate(function() {
						return document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[2].innerText
					})
					.then(function(title) {
						console.log('Anime ID:');
						console.log(title);
						animeID.push(title);
						ijpnUrlList.shift();
						tvDBsearch(ijpnUrlList);
					})
					.catch(function (error) {
						console.log(error);
					})
			}
			else {
				console.log('It is missing');
				GUI
					.goto('https://www.thetvdb.com/search?l=en&q=' + ijpnUrlList[0])
					.wait('div.form-group')
					.exists('table.table.table-hover')
					.then(function(exists) {
						if(exists) {
							GUI
								.evaluate(function() {
									return document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[2].innerText
								})
								.then(function(title) {
									console.log('Anime ID:');
									console.log(title);
									animeID.push(title);
									ijpnUrlList.shift();
									tvDBsearch(ijpnUrlList);
								})
								.catch(function (error) {
									console.log(error);
								})
						}
						else {
							console.log('Cannot find it so putting in fake info');
							animeID.push('MISSING');
							ijpnUrlList.shift();
							tvDBsearch(ijpnUrlList);
						}
					})
			}
		})
		.catch(function (error) {
			console.log(error);
		})
	}
	else {
		Log.data('Anime ID', animeID, true);
		dataPacker();
		for(var i = 0; newAnime[i]; i++) {
			previousAnimeLoaded.push(newAnime[i]);
		}
		Log.initOverrideV2('./', 'loaded.json')
		Log.data('', previousAnimeLoaded);
		Log.fixData();
		console.log('Execution is complete');
	}
}

var dataPacker = function() {
	Log.initBasicV2('./', 'OUTPUT');
	for(var i = 0; cleanAnimeList[i]; i++) {
		if(animeID[i] == 'MISSING') {
			Log.print('>-------------------------WARNING BELOW--------------------<\n');
		}
		Log.print('      - ' + cleanAnimeList[i] + ':\n');
		Log.print('          set:\n');
		Log.print('            tvdb_id:  ' + animeID[i] + '\n');
		if(animeID[i] == 'MISSING') {
			Log.print('>-------------------------WARNING ABOVE--------------------<\n');
		}
	}
}

//thetvdb search:
/*

take title from above and 
encodeURI('邪神ちゃんドロップキック')


https://www.thetvdb.com/search?l=ja&q=%E9%82%AA%E7%A5%9E%E3%81%A1%E3%82%83%E3%82%93%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E3%82%AD%E3%83%83%E3%82%AF

in the above get the entire table

document.getElementsByTagName('table')

we only care about the rows
document.getElementsByTagName('table')[0].getElementsByTagName('tr')

ignore the first tr cuz thats just titles

document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1]

get the id
document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[2].innerText





*/








