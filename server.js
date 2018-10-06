

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

var cleanAnimeList = [];
var urlAnimeList = [];
var jpnAnimeList = [];
var jpnUrlAnimeList = [];
var animeID = [];

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
		autoHideMenuBar: true,
		openDevTools: {
			mode: 'detach'
		  }
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
			for(var i = 0; cleanAnimeList[i]; i++) {
				urlAnimeList.push(encodeURI(cleanAnimeList[i]));
			}
			Log.data('URL Encoded', urlAnimeList, true);
			malSearch(urlAnimeList);
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


var testdata = [ '%E3%81%82%E3%81%8B%E3%81%AD%E3%81%95%E3%81%99%E5%B0%91%E5%A5%B3',
'%E5%B9%95%E6%9C%ABRock',
'BANANA%20FISH',
'%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF%E3%82%AF%E3%83%AD%E3%83%BC%E3%83%90%E3%83%BC',
'%E3%81%BC%E3%81%AE%E3%81%BC%E3%81%AE',
'BORUTO%20-NARUTO%20NEXT%20GENERATIONS-',
'%E3%82%AB%E3%83%BC%E3%83%89%E3%83%95%E3%82%A1%E3%82%A4%E3%83%88!!%20%E3%83%B4%E3%82%A1%E3%83%B3%E3%82%AC%E3%83%BC%E3%83%89%20(2018)',
'%E4%B8%AD%E9%96%93%E7%AE%A1%E7%90%86%E9%8C%B2%E3%83%88%E3%83%8D%E3%82%AC%E3%83%AF',
'%E6%8A%B1%E3%81%8B%E3%82%8C%E3%81%9F%E3%81%84%E7%94%B71%E4%BD%8D%E3%81%AB%E8%84%85%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%82',
'%E5%90%8D%E6%8E%A2%E5%81%B5%E3%82%B3%E3%83%8A%E3%83%B3',
'%E3%82%B2%E3%82%B2%E3%82%B2%E3%81%AE%E9%AC%BC%E5%A4%AA%E9%83%8E%20(2018)',
'%E9%8A%80%E9%AD%82',
'%E3%82%B0%E3%83%A9%E3%82%BC%E3%83%8B',
'%E3%81%AF%E3%81%AD%E3%83%90%E3%83%89%EF%BC%81',
'%E7%81%AB%E3%83%8E%E4%B8%B8%E7%9B%B8%E6%92%B2',
'%E8%89%B2%E3%81%A5%E3%81%8F%E4%B8%96%E7%95%8C%E3%81%AE%E6%98%8E%E6%97%A5%E3%81%8B%E3%82%89',
'%E9%82%AA%E7%A5%9E%E3%81%A1%E3%82%83%E3%82%93%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E3%82%AD%E3%83%83%E3%82%AF',
'%E4%BA%BA%E5%A4%96%E3%81%95%E3%82%93%E3%81%AE%E5%AB%81',
'%E3%82%B8%E3%83%A7%E3%82%B8%E3%83%A7%E3%81%AE%E5%A5%87%E5%A6%99%E3%81%AA%E5%86%92%E9%99%BA%20%E9%BB%84%E9%87%91%E3%81%AE%E9%A2%A8',
'%E9%A2%A8%E3%81%8C%E5%BC%B7%E3%81%8F%E5%90%B9%E3%81%84%E3%81%A6%E3%81%84%E3%82%8B',
'%E8%BB%92%E8%BD%85%E5%89%A3%E3%83%BB%E8%92%BC%E3%81%8D%E6%9B%9C',
'%E5%AF%84%E5%AE%BF%E5%AD%A6%E6%A0%A1%E3%81%AE%E3%82%B8%E3%83%A5%E3%83%AA%E3%82%A8%E3%83%83%E3%83%88',
'%E3%83%A0%E3%83%92%E3%83%A7%E3%81%A8%E3%83%AD%E3%83%BC%E3%82%B8%E3%83%BC%E3%81%AE%E9%AD%94%E6%B3%95%E5%BE%8B%E7%9B%B8%E8%AB%87%E4%BA%8B%E5%8B%99%E6%89%80',
'ONE%20PIECE',
'%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E3%83%AD%E3%83%BC%E3%83%89%E2%85%A2',
'%E3%83%91%E3%82%BA%E3%83%89%E3%83%A9%E3%82%AF%E3%83%AD%E3%82%B9',
'RErideD%EF%BC%8D%E5%88%BB%E8%B6%8A%E3%81%88%E3%81%AE%E3%83%87%E3%83%AA%E3%83%80%EF%BC%8D',
'%E6%AE%BA%E6%88%AE%E3%81%AE%E5%A4%A9%E4%BD%BF',
'%E9%9D%92%E6%98%A5%E3%83%96%E3%82%BF%E9%87%8E%E9%83%8E%E3%81%AF%E3%83%90%E3%83%8B%E3%83%BC%E3%82%AC%E3%83%BC%E3%83%AB%E5%85%88%E8%BC%A9%E3%81%AE%E5%A4%A2%E3%82%92%E8%A6%8B%E3%81%AA%E3%81%84',
'%E9%80%B2%E6%92%83%E3%81%AE%E5%B7%A8%E4%BA%BA',
'%E5%B0%91%E5%B9%B4%E3%82%A2%E3%82%B7%E3%83%99%20GO!%20GO!%20%E3%82%B4%E3%83%9E%E3%81%A1%E3%82%83%E3%82%93%203',
'%E3%82%BD%E3%83%A9%E3%81%A8%E3%82%A6%E3%83%9F%E3%81%AE%E3%82%A2%E3%82%A4%E3%83%80',
'%E7%A5%9E%E6%92%83%E3%81%AE%E3%83%90%E3%83%8F%E3%83%A0%E3%83%BC%E3%83%88%20GENESIS',
'%E8%BB%A2%E7%94%9F%E3%81%97%E3%81%9F%E3%82%89%E3%82%B9%E3%83%A9%E3%82%A4%E3%83%A0%E3%81%A0%E3%81%A3%E3%81%9F%E4%BB%B6',
'%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%20%E3%82%B7%E3%83%B3%E3%83%87%E3%83%AC%E3%83%A9%E3%82%AC%E3%83%BC%E3%83%AB%E3%82%BA',
'%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%20%E3%82%B7%E3%83%B3%E3%83%87%E3%83%AC%E3%83%A9%E3%82%AC%E3%83%BC%E3%83%AB%E3%82%BA',
'%E6%A9%9F%E5%8B%95%E6%88%A6%E5%A3%AB%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0%20%E3%82%B5%E3%83%B3%E3%83%80%E3%83%BC%E3%83%9C%E3%83%AB%E3%83%88',
'%E3%81%A8%E3%81%AA%E3%82%8A%E3%81%AE%E5%90%B8%E8%A1%80%E9%AC%BC%E3%81%95%E3%82%93',
'%E3%81%A4%E3%81%8F%E3%82%82%E3%81%8C%E3%81%BF%E8%B2%B8%E3%81%97%E3%81%BE%E3%81%99',
'%E3%81%86%E3%81%A1%E3%81%AE%E3%83%A1%E3%82%A4%E3%83%89%E3%81%8C%E3%82%A6%E3%82%B6%E3%81%99%E3%81%8E%E3%82%8B%EF%BC%81',
'%E5%AE%87%E5%AE%99%E6%88%A6%E8%89%A6%E3%83%86%E3%82%A3%E3%83%A9%E3%83%9F%E3%82%B9',
'%E3%82%84%E3%81%8C%E3%81%A6%E5%90%9B%E3%81%AB%E3%81%AA%E3%82%8B',
'%E9%81%8A%E6%88%AF%E7%8E%8BVRAINS',
'%E3%82%BE%E3%83%B3%E3%83%93%E3%83%A9%E3%83%B3%E3%83%89%E3%82%B5%E3%82%AC' ]

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








