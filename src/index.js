import { DateTime } from 'luxon';

const allRadioInput = document.querySelectorAll('input[type=radio');
const searchBoxInput = document.querySelector('.searchBoxInput');
const changeUnits = document.querySelector('.changeUnits');
const searchIcon = document.querySelector('.searchIcon');

const keyAPI = 'c40fcb991f5231199fa7282aa3268d17';

let unitsSystem = 'metric';
let myData = {};

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
	if (unitsSystem === 'metric') {
		e.target.textContent = 'Switch to Metric';
		unitsSystem = 'imperial';
	} else if (unitsSystem === 'imperial') {
		e.target.textContent = 'Switch to Imperial';
		unitsSystem = 'metric';
	}
	dataRenderHandler();
});

function renderBasicWeather(data) {
	document.querySelector('.weatherBasic_description').textContent =
		data.current.weather[0].description
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	document.querySelector('.weatherBasic_location').textContent =
		data.city + ', ' + data.country;
	document.querySelector('.weatherBasic_timeWeekday').textContent =
		DateTime.now().setZone(data.timezone).toFormat('EEEE HH:mm');
	document.querySelector('.weatherBasic_date').textContent = DateTime.now()
		.setZone(data.timezone)
		.toFormat('dd.MM.yyyy');
	document.querySelector('.weatherBasic_coordLat').textContent =
		'Lat: ' + data.lat.toFixed(2);
	document.querySelector('.weatherBasic_coordLon').textContent =
		'Lon: ' + data.lon.toFixed(2);
	document.querySelector('.weatherBasic_temp').textContent = convertTemp(
		data.current.temp
	);
	document.querySelector('.weatherBasic_icon').src =
		'imgs/' + data.current.weather[0].icon + '.svg';
}

function renderExtraWeather(data) {
	document.querySelector('.weatherExtra_feels').textContent = convertTemp(
		data.current.feels_like
	);
	document.querySelector('.weatherExtra_wind').textContent = convertSpeed(
		data.current.wind_speed
	);
	document.querySelector('.weatherExtra_humidity').textContent =
		data.current.humidity + ' %';
	document.querySelector('.weatherExtra_pressure').textContent =
		data.current.pressure + ' hPa';
}

function renderDailyForecast(data) {
	const days = document.querySelectorAll('.forecastDaily');
	for (let i = 0; i < 8; i++) {
		days[i].innerHTML = '';
		let temp = document.createElement('div');
		temp.textContent = DateTime.fromSeconds(data.daily[i].dt).toFormat(
			'EEE, dd.MM.yy'
		);
		days[i].append(temp);
		let date = document.createElement('div');
		date.textContent = convertTemp(data.daily[i].temp.day);
		days[i].append(date);
		let icon = document.createElement('img');
		icon.src = 'imgs/' + data.daily[i].weather[0].icon + '.svg';
		icon.classList.add('weatherForecast_icon');
		days[i].append(icon);
	}
}

function renderHourlyForecast(data) {
	const days = document.querySelectorAll('.forecastHourly');
	for (let i = 0; i < 24; i++) {
		days[i].innerHTML = '';
		let temp = document.createElement('div');
		temp.textContent = DateTime.fromSeconds(data.hourly[i].dt).toFormat(
			'EEE, HH:mm'
		);
		days[i].append(temp);
		let date = document.createElement('div');
		date.textContent = convertTemp(data.hourly[i].temp);
		days[i].append(date);
		let icon = document.createElement('img');
		icon.src = 'imgs/' + data.hourly[i].weather[0].icon + '.svg';
		icon.classList.add('weatherForecast_icon');
		days[i].append(icon);
	}
}

function convertTemp(temp) {
	if (unitsSystem === 'metric') {
		return (temp - 273.15).toFixed(1) + ' °C';
	} else if ('imperial') {
		return (temp * 1.8 - 459.67).toFixed(1) + ' °F';
	}
}

function convertSpeed(speed) {
	if (unitsSystem === 'metric') {
		return (speed * 3.6).toFixed(1) + ' km/h';
	} else if ('imperial') {
		return (speed * 2.2369).toFixed(1) + ' mph';
	}
}

function dataRenderHandler() {
	renderBasicWeather(myData);
	renderExtraWeather(myData);
	renderDailyForecast(myData);
	renderHourlyForecast(myData);
}

async function APIDataHandler(userInput) {
	try {
		const query = formatQuery(userInput);
		const locationData = await getCoordinates(query);
		const responseData = await getOneCallData(locationData);
		myData = { ...responseData, ...locationData };
		dataRenderHandler();
	} catch (error) {
		console.log(error);
	}
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

async function getCoordinates(query) {
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

async function getOneCallData(coord) {
	try {
		const response = await fetch(
			'https://api.openweathermap.org/data/2.5/onecall?lat=' +
				coord.lat +
				'&lon=' +
				coord.lon +
				'&exclude=minutely,alerts&appid=' +
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

APIDataHandler('Amsterdam, NL');
