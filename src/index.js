import { DateTime } from 'luxon';

const allRadioInput = document.querySelectorAll('input[type=radio');
const searchBoxInput = document.getElementById('searchBoxInput');
const changeUnits = document.querySelector('.changeUnits');
const searchIcon = document.querySelector('.searchIcon');
const dailyBtn = document.querySelector('.dailyBtn');
const hourlyBtn = document.querySelector('.hourlyBtn');
const dailyForecast = document.querySelector('.weatherDailyForecast');
const hourlyForecast = document.querySelectorAll('.weatherHourlyForecast');
const prevArrow = document.querySelector('.prevArrow');
const nextArrow = document.querySelector('.nextArrow');
const allDots = document.querySelectorAll('.dot');
const changeHours = document.querySelector('.changeHours');

const keyAPI = 'd4d662ab03fdbbf46e6cd2623cccdfad';

let slideIndex = 1;
let metricSystem = true;
let myData = {};

dailyBtn.addEventListener('click', () => {
	dailyBtn.classList.add('activeBtn');
	dailyForecast.style.display = 'flex';
	hourlyBtn.classList.remove('activeBtn');
	for (let i = 0; i < hourlyForecast.length; i++) {
		hourlyForecast[i].style.display = 'none';
	}
	changeHours.style.display = 'none';
});

hourlyBtn.addEventListener('click', () => {
	hourlyBtn.classList.add('activeBtn');
	for (let i = 0; i < hourlyForecast.length; i++) {
		hourlyForecast[i].style.display = 'flex';
	}
	changeHours.style.display = 'flex';
	dailyBtn.classList.remove('activeBtn');
	dailyForecast.style.display = 'none';
	changeHourly(slideIndex);
});

prevArrow.addEventListener('click', () => {
	changeHourly((slideIndex += -1));
});

nextArrow.addEventListener('click', () => {
	changeHourly((slideIndex += 1));
});

allDots.forEach((dot) => {
	dot.addEventListener('click', (e) => {
		for (let i = 0; i < allDots.length; i++) {
			if (e.target === allDots[i]) {
				changeHourly((slideIndex = i + 1));
			}
		}
	});
});

function changeHourly(x) {
	let i;
	if (x > hourlyForecast.length) {
		slideIndex = 1;
	}
	if (x < 1) {
		slideIndex = hourlyForecast.length;
	}
	for (i = 0; i < hourlyForecast.length; i++) {
		hourlyForecast[i].style.display = 'none';
	}
	for (i = 0; i < allDots.length; i++) {
		allDots[i].classList.remove('activeDot');
	}
	hourlyForecast[slideIndex - 1].style.display = 'flex';
	allDots[slideIndex - 1].classList.add('activeDot');
}

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
	if (metricSystem) {
		e.target.textContent = 'Switch to Metric';
	} else {
		e.target.textContent = 'Switch to Imperial';
	}
	metricSystem = !metricSystem;
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
		'./imgs/' + data.current.weather[0].icon + '.svg';
}

function renderExtraWeather(data) {
	document.querySelector('.weatherExtra_feels').textContent = convertTemp(
		data.current.feels_like
	);
	document.querySelector('.weatherExtra_humidity').textContent =
		data.current.humidity + '%';

	document.querySelector('.weatherExtra_wind').textContent = convertSpeed(
		data.current.wind_speed
	);

	document.querySelector('.weatherExtra_pressure').textContent =
		data.current.pressure + '  hPa';
}

function renderDailyForecast(data) {
	const days = document.querySelectorAll('.forecastDaily');
	for (let i = 0; i < 8; i++) {
		days[i].innerHTML = '';
		let con = document.createElement('div');
		con.className = 'forecastMetadata';

		let fullDate = document.createElement('span');
		fullDate.className = 'date';

		let day = document.createElement('h3');
		day.textContent = DateTime.fromSeconds(data.daily[i].dt).toFormat('EEEE');

		let date = document.createElement('h3');
		date.textContent = DateTime.fromSeconds(data.daily[i].dt).toFormat(
			'dd.MM.yy'
		);

		let temp = document.createElement('h2');
		temp.className = 'temp';
		temp.textContent = convertTemp(data.daily[i].temp.day);

		let icon = document.createElement('img');
		icon.src = './imgs/' + data.daily[i].weather[0].icon + '.svg';
		icon.classList.add('weatherForecast_icon');

		fullDate.append(day, date);
		con.append(fullDate, temp);
		days[i].append(con, icon);
	}
}

function renderHourlyForecast(data) {
	const days = document.querySelectorAll('.forecastHourly');
	for (let i = 0; i < 24; i++) {
		days[i].innerHTML = '';
		let con = document.createElement('div');
		con.className = 'forecastMetadata';

		let fullDate = document.createElement('span');
		fullDate.className = 'date';

		let day = document.createElement('h3');
		day.textContent = DateTime.fromSeconds(data.hourly[i].dt).toFormat('EEEE');

		let hour = document.createElement('h3');
		hour.textContent = DateTime.fromSeconds(data.hourly[i].dt).toFormat(
			'HH:mm'
		);

		let temp = document.createElement('h2');
		temp.className = 'temp';
		temp.textContent = convertTemp(data.hourly[i].temp);

		let icon = document.createElement('img');
		icon.src = './imgs/' + data.hourly[i].weather[0].icon + '.svg';
		icon.classList.add('weatherForecast_icon');

		fullDate.append(day, hour);
		con.append(fullDate, temp);
		days[i].append(con, icon);
	}
}

function convertTemp(temp) {
	if (metricSystem) {
		return Math.round((temp - 273.15) * 10) / 10 + '°C';
	} else {
		return Math.round((temp * 1.8 - 459.67) * 10) / 10 + '°F';
	}
}

function convertSpeed(speed) {
	if (metricSystem) {
		return Math.round(speed * 10) / 10 + ' m/s';
	} else {
		return Math.round(speed * 2.236936 * 10) / 10 + ' mph';
	}
}

function dataRenderHandler() {
	renderBasicWeather(myData);
	renderExtraWeather(myData);
	renderDailyForecast(myData);
	renderHourlyForecast(myData);
	document.querySelector('.loading_icon').style.display = 'none';
	document.querySelector('.main').style.display = 'flex';
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			APIDataHandler,
			handleGeolocationError
		);
	} else {
		console.log('Geolocation is not supported by this browser.');
		APIDataHandler('Amsterdam, NL');
	}
}

function handleGeolocationError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			console.log('User denied the request for Geolocation.');
			APIDataHandler('Amsterdam, NL');
			break;
		case error.POSITION_UNAVAILABLE:
			console.log('Location information is unavailable.');
			APIDataHandler('Amsterdam, NL');
			break;
		case error.TIMEOUT:
			console.log('The request to get user location timed out.');
			APIDataHandler('Amsterdam, NL');
			break;
		default:
			console.log('An unknown error occurred.');
			APIDataHandler('Amsterdam, NL');
			break;
	}
}

async function APIDataHandler(userInput) {
	try {
		const query = formatQuery(userInput);
		const locationData = await getCoordinates(query);
		const responseData = await getOneCallData(locationData);
		myData = { ...responseData, ...locationData };
		dataRenderHandler();
	} catch (error) {
		console.log('APIDataHandler: ' + error);
		loadError();
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
	let type = null;
	if (value.coords) {
		type = 'geolocation';
	} else {
		type = checkedRadioID();
	}
	switch (type) {
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
		case 'geolocation':
			query = 'lat=' + value.coords.latitude + '&lon=' + value.coords.longitude;
			return query;
	}
}

function loadError() {
	alert(
		'Error! Could not get the location. Make sure you chose the correct search type.'
	);
}

allRadioInput.forEach((radio) => {
	radio.addEventListener('click', () => {
		switch (checkedRadioID()) {
			case 'cityName':
				searchBoxInput.placeholder = 'e.g. New York, US';
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
		console.log('getCoordinates: ' + error);
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
		console.log('getOneCallData: ' + error);
	}
}

getLocation();
