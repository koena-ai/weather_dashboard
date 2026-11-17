
// Get HTML elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription = document.getElementById("weatherDescription");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const forecastContainer =
    document.getElementById("forecastContainer");

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");

const currentWeather =
    document.getElementById("currentWeather");

const forecastSection =
    document.getElementById("forecastSection");


// Weather condition mapping
function getWeatherInfo(code) {

    const weatherCodes = {
        0: ["☀️", "Clear Sky"],
        1: ["🌤️", "Mainly Clear"],
        2: ["⛅", "Partly Cloudy"],
        3: ["☁️", "Overcast"],
        45: ["🌫️", "Fog"],
        48: ["🌫️", "Depositing Rime Fog"],
        51: ["🌦️", "Light Drizzle"],
        53: ["🌦️", "Moderate Drizzle"],
        55: ["🌧️", "Dense Drizzle"],
        61: ["🌧️", "Slight Rain"],
        63: ["🌧️", "Moderate Rain"],
        65: ["🌧️", "Heavy Rain"],
        71: ["🌨️", "Slight Snow"],
        73: ["❄️", "Moderate Snow"],
        75: ["❄️", "Heavy Snow"],
        77: ["🌨️", "Snow Grains"],
        80: ["🌦️", "Rain Showers"],
        81: ["🌧️", "Moderate Showers"],
        82: ["⛈️", "Violent Showers"],
        85: ["🌨️", "Snow Showers"],
        86: ["❄️", "Heavy Snow Showers"],
        95: ["⛈️", "Thunderstorm"],
        96: ["⛈️", "Thunderstorm with Hail"],
        99: ["⛈️", "Heavy Thunderstorm"]
    };

    return weatherCodes[code] || ["🌡️", "Unknown Weather"];
}


// Get city coordinates using Geocoding API
async function getCityCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for this city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city name.");
    }

    return data.results[0];
}


// Get weather information
async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch weather information.");
    }

    return await response.json();
}


// Display current weather
function displayCurrentWeather(data, city) {

    const current = data.current;

    const weather = getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${city.name}, ${city.country}`;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    weatherIcon.textContent = weather[0];

    weatherDescription.textContent = weather[1];

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

}


// Display 5-day forecast
function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const daily = data.daily;

    daily.time.forEach((date, index) => {

        const weather = getWeatherInfo(
            daily.weather_code[index]
        );

        const forecastDate = new Date(date + "T12:00:00");

        const day = forecastDate.toLocaleDateString(
            "en-US",
            { weekday: "short" }
        );

        const card = document.createElement("div");

        card.className = "forecast-card";

        // Create forecast elements safely
        const dayName = document.createElement("h3");
        dayName.textContent = day;

        const icon = document.createElement("div");
        icon.className = "forecast-icon";
        icon.textContent = weather[0];

        const condition = document.createElement("p");
        condition.textContent = weather[1];

        const maxTemp = document.createElement("p");
        maxTemp.className = "max-temp";
        maxTemp.textContent =
            `Max: ${Math.round(daily.temperature_2m_max[index])}°C`;

        const minTemp = document.createElement("p");
        minTemp.className = "min-temp";
        minTemp.textContent =
            `Min: ${Math.round(daily.temperature_2m_min[index])}°C`;

        card.append(
            dayName,
            icon,
            condition,
            maxTemp,
            minTemp
        );

        forecastContainer.appendChild(card);

    });
}


// Main search function
async function searchWeather() {

    const city = cityInput.value.trim();

    // Validate input
    if (city === "") {
        errorMessage.textContent =
            "Please enter a city name.";
        return;
    }

    errorMessage.textContent = "";
    loadingMessage.style.display = "block";
    currentWeather.style.display = "none";
    forecastSection.style.display = "none";

    searchBtn.disabled = true;

    try {

        // Get city details
        const location = await getCityCoordinates(city);

        // Get weather data
        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        );

        // Display weather
        displayCurrentWeather(weatherData, location);

        displayForecast(weatherData);

        currentWeather.style.display = "block";
        forecastSection.style.display = "block";

    } catch (error) {

        errorMessage.textContent = error.message;

    } finally {

        loadingMessage.style.display = "none";
        searchBtn.disabled = false;

    }
}


// Search button click event
searchBtn.addEventListener("click", searchWeather);


// Enter key event
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


// Load default city when page opens
cityInput.value = "Kolkata";
searchWeather();
