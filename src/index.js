import { DateTime } from 'luxon';

const keyAPI = '&appid=c40fcb991f5231199fa7282aa3268d17';
let unitSystem = 'metric';
let myData = {};

document.querySelector('.searchBox').addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		requestData(formatSearchQuery(e.target.value));
		e.target.value = '';
	}
});

document.querySelector('.changeUnits').addEventListener('click', (e) => {
	if (unitSystem === 'metric') {
		e.target.textContent = 'Show in Metric';
		unitSystem = 'imperial';
	} else if (unitSystem === 'imperial') {
		e.target.textContent = 'Show in Imperial';
		unitSystem = 'metric';
	}
	displayData(myData, unitSystem);
});

async function requestData(query) {
	try {
		const response = await fetch(
			'https://api.openweathermap.org/data/2.5/weather?' + query + keyAPI,
			{
				mode: 'cors',
			}
		);
		processData(await response.json());
	} catch (error) {
		console.log(error);
		loadError();
	}
}

function processData(data) {
	myData = {
		coord: {
			lon: data.coord.lon.toFixed(2),
			lat: data.coord.lat.toFixed(2),
		},
		weather: data.weather[0].description
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' '),
		icon: data.weather[0].icon,
		metric: {
			temp: {
				current: (data.main.temp - 273.15).toFixed(1) + ' °C',
				feels: (data.main.feels_like - 273.15).toFixed(1) + ' °C',
				min: (data.main.temp_min - 273.15).toFixed(1) + ' °C',
				max: (data.main.temp_max - 273.15).toFixed(1) + ' °C',
			},
			wind: {
				speed: (data.wind.speed * 3.6).toFixed(1) + ' km/h',
			},
		},
		imperial: {
			temp: {
				current: (data.main.temp * 1.8 - 459.67).toFixed(1) + ' °F',
				feels: (data.main.feels_like * 1.8 - 459.67).toFixed(1) + ' °F',
				min: (data.main.temp_min * 1.8 - 459.67).toFixed(1) + ' °F',
				max: (data.main.temp_max * 1.8 - 459.67).toFixed(1) + ' °F',
			},
			wind: {
				speed: (data.wind.speed * 2.2369).toFixed(1) + ' mph',
			},
		},
		pressure: data.main.pressure + ' hPa',
		humidity: data.main.humidity + '%',
		location: data.name + ', ' + data.sys.country,
		timeDay: DateTime.utc()
			.plus({ seconds: data.timezone })
			.toFormat('HH:mm, EEEE'),
		date: DateTime.utc()
			.plus({ seconds: data.timezone })
			.toFormat('dd.MM.yyyy'),
	};
	updateBackground(myData.weather);
	displayData(myData, unitSystem);
}

async function updateBackground(query) {
	try {
		const response = await fetch(
			'https://api.giphy.com/v1/gifs/translate?api_key=tdmQtHTXgoVAneoHsjqOQsCHo6Snca9k&s=' +
				query,
			{ mode: 'cors' }
		);
		const data = await response.json();
		const image = data.data.images.original_still.url;
		document.querySelector('body').style.backgroundImage =
			'url(' + image + ')';
	} catch (error) {
		console.log(error);
	}
}

function displayData(data, units) {
	document.querySelector('.weatherInfo_description').textContent =
		data.weather;
	document.querySelector('.weatherInfo_location').textContent = data.location;
	document.querySelector('.weatherInfo_timeDay').textContent = data.timeDay;
	document.querySelector('.weatherInfo_date').textContent = data.date;
	document.querySelector('.weatherInfo_coordLat').textContent =
		'Lat: ' + data.coord.lat;
	document.querySelector('.weatherInfo_coordLon').textContent =
		'Lon: ' + data.coord.lon;
	document.querySelector('.weatherInfo_temp').textContent =
		data[units].temp.current;
	document.querySelector('.weatherInfo_icon').src =
		'imgs/' + data.icon + '.svg';
	document.querySelector('.weatherInfo_icon').alt = data.description;

	document.querySelector('.weatherMoreInfo_feels').textContent =
		data[units].temp.feels;
	document.querySelector('.weatherMoreInfo_minTemp').textContent =
		data[units].temp.min;
	document.querySelector('.weatherMoreInfo_maxTemp').textContent =
		data[units].temp.max;
	document.querySelector('.weatherMoreInfo_wind').textContent =
		data[units].wind.speed;
	document.querySelector('.weatherMoreInfo_humidity').textContent =
		data.humidity;
	document.querySelector('.weatherMoreInfo_pressure').textContent =
		data.pressure;
}

function checkSearchType() {
	const options = document.querySelectorAll('input[type=radio]');
	let type = null;
	for (let i = 0; i < options.length; i++) {
		if (options[i].checked) {
			type = options[i].id;
		}
	}
	return type;
}

function formatSearchQuery(inputValue) {
	let query = null;
	let arr = null;
	switch (checkSearchType()) {
		case 'cityName':
			return (query = 'q=' + inputValue);
		case 'cityZip':
			arr = inputValue.split(/[ \.,]+/);
			query = 'zip=' + arr[0] + ',' + arr[1];
			return query;
		case 'cityLatLon':
			arr = inputValue.split(' ');
			query = 'lat=' + arr[0] + '&lon=' + arr[1];
			return query;
		case 'cityID':
			return (query = 'id=' + inputValue);
	}
}

function loadError() {
	alert('err');
}

requestData('q=Amsterdam');
