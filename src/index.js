import { DateTime } from 'luxon';

const allRadioInput = document.querySelectorAll('input[type=radio');
const searchBoxInput = document.querySelector('.searchBoxInput');
const changeUnits = document.querySelector('.changeUnits');
const searchIcon = document.querySelector('.searchIcon');

const keyAPI = 'c40fcb991f5231199fa7282aa3268d17';
let unitSystem = 'metric';

searchIcon.addEventListener('click', () => {
	APIDataHandler(searchBoxInput.value);
	searchBoxInput.value = '';
});

searchBoxInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		APIDataHandler(searchBoxInput.value);
		searchBoxInput.value = '';
	}
});

changeUnits.addEventListener('click', (e) => {
	if (unitSystem === 'metric') {
		e.target.textContent = 'Show in Metric';
		unitSystem = 'imperial';
	} else if (unitSystem === 'imperial') {
		e.target.textContent = 'Show in Imperial';
		unitSystem = 'metric';
	}
	dataDisplayHandler(unitSystem);
});

// function processData(rawData, locData) {
// 	const processedData = {
// 		lat: rawData.lat,
// 		lon: rawData.lon,
// 		location: locData.city + ', ' + locData.country,
// 		timeWeekday: DateTime.now()
// 			.setZone(rawData.timezone)
// 			.toFormat('HH:mm, EEEE'),
// 		date: DateTime.now().setZone(rawData.timezone).toFormat('dd.MM.yyyy'),
// 		weather: rawData.current.weather[0].description
// 			.split(' ')
// 			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
// 			.join(' '),
// 		icon: rawData.current.weather[0].icon,
// 		pressure: rawData.current.pressure + ' hPa',
// 		humidity: rawData.current.humidity + '%',
// 		metric: {
// 			temp: {
// 				current: (rawData.current.temp - 273.15).toFixed(1) + ' °C',
// 				feels: (rawData.current.feels_like - 273.15).toFixed(1) + ' °C',
// 			},
// 			wind: {
// 				speed: (rawData.current.wind_speed * 3.6).toFixed(1) + ' km/h',
// 			},
// 		},
// 		imperial: {
// 			temp: {
// 				current:
// 					(rawData.current.temp * 1.8 - 459.67).toFixed(1) + ' °F',
// 				feels:
// 					(rawData.current.feels_like * 1.8 - 459.67).toFixed(1) +
// 					' °F',
// 			},
// 			wind: {
// 				speed:
// 					(rawData.current.wind_speed * 2.2369).toFixed(1) + ' mph',
// 			},
// 		},
// 	};
// 	return processedData;
// }

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

function displayBasicWeather(data, units) {
	document.querySelector('.weatherBasic_description').textContent =
		data.weather;
	document.querySelector('.weatherBasic_location').textContent =
		data.location;
	document.querySelector('.weatherBasic_timeWeekday').textContent =
		data.timeWeekday;
	document.querySelector('.weatherBasic_date').textContent = data.date;
	document.querySelector('.weatherBasic_coordLat').textContent =
		'Lat: ' + data.lat;
	document.querySelector('.weatherBasic_coordLon').textContent =
		'Lon: ' + data.lon;
	document.querySelector('.weatherBasic_temp').textContent =
		data[units].temp.current;
	document.querySelector('.weatherBasic_icon').src =
		'imgs/' + data.icon + '.svg';
	document.querySelector('.weatherBasic_icon').alt = data.description;
}

function displayExtraWeather(data, units) {
	document.querySelector('.weatherExtra_feels').textContent =
		data[units].temp.feels;
	document.querySelector('.weatherExtra_wind').textContent =
		data[units].wind.speed;
	document.querySelector('.weatherExtra_humidity').textContent =
		data.humidity;
	document.querySelector('.weatherExtra_pressure').textContent =
		data.pressure;
}

// function displayMinutelyForecast(data, units) {}

function displayHourlyForecast(data, units) {}

function displayDailyForecast(data, units) {}

function dataDisplayHandler() {
	displayBasicWeather();
	displayExtraWeather();
	displayMinutelyForecast();
	displayHourlyForecast();
	displayDailyForecast();
}

function checkedRadioID() {
	let type = null;
	for (let i = 0; i < allRadioInput.length; i++) {
		if (allRadioInput[i].checked) {
			type = allRadioInput[i].id;
		}
	}
	return type;
}

function formatQuery(value) {
	let query = null;
	let arr = null;
	switch (checkedRadioID()) {
		case 'cityName':
			return (query = 'q=' + value);
		case 'cityZip':
			arr = value.split(/[ \.,]+/);
			query = 'zip=' + arr[0] + ',' + arr[1];
			return query;
		case 'cityLatLon':
			arr = value.split(/[ \,]+/);
			query = 'lat=' + arr[0] + '&lon=' + arr[1];
			return query;
		case 'cityID':
			return (query = 'id=' + value);
	}
}

function loadError() {
	alert('err');
}

allRadioInput.forEach((radio) => {
	radio.addEventListener('click', () => {
		switch (checkedRadioID()) {
			case 'cityName':
				searchBoxInput.placeholder = 'e.g. Amsterdam, NL';
				break;
			case 'cityZip':
				searchBoxInput.placeholder = 'e.g. 94040, US';
				break;
			case 'cityLatLon':
				searchBoxInput.placeholder = 'e.g. 35.56 139.2';
				break;
			case 'cityID':
				searchBoxInput.placeholder = 'e.g. 2172797';
				break;
		}
	});
});

async function APIDataHandler(userInput) {
	try {
		const query = formatQuery(userInput);
		const locationData = await getCoordinatesFromAPI(query);
		const responseData = await getOneCallDataFromAPI(locationData);
		dataDisplayHandler(responseData);
		updateBackground(responseData.weather[0].description);
		displayBasicWeather(responseData, unitSystem);
	} catch (error) {
		console.log(error);
	}
}

async function getCoordinatesFromAPI(query) {
	try {
		const response = await fetch(
			'https://api.openweathermap.org/data/2.5/weather?' +
				query +
				'&appid=' +
				keyAPI,
			{
				mode: 'cors',
			}
		);
		const data = await response.json();
		const coords = {
			lat: data.coord.lat,
			lon: data.coord.lon,
			city: data.name,
			country: data.sys.country,
		};
		return coords;
	} catch (error) {
		console.log(error);
	}
}

async function getOneCallDataFromAPI(loc) {
	try {
		const response = await fetch(
			'https://api.openweathermap.org/data/2.5/onecall?lat=' +
				loc.lat +
				'&lon=' +
				loc.lon +
				'&exclude=minutely&appid=' +
				keyAPI,
			{
				mode: 'cors',
			}
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}

// Amsterdam 52.374, lon: 4.8897
APIDataHandler('Amsterdam, NL');
