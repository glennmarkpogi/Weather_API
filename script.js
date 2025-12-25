// API Configuration
const API_KEY = config.API_KEY;
let currentCity = 'Dagupan';
const COUNTRY_CODE = 'PH';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const currentDateEl = document.getElementById('current-date');
const sunriseTimeEl = document.getElementById('sunrise-time');
const sunsetTimeEl = document.getElementById('sunset-time');
const cityDisplayEl = document.getElementById('city-display');
const currentTempEl = document.getElementById('current-temp');
const weatherDescEl = document.getElementById('weather-desc');
const detailedDescEl = document.getElementById('detailed-desc');
const predictionDescEl = document.getElementById('prediction-desc');
const visibilityEl = document.getElementById('visibility');
const humidityEl = document.getElementById('humidity');
const forecastListEl = document.getElementById('forecast-list');
const errorContainer = document.getElementById('error-container');
const loadingIndicator = document.getElementById('loading-indicator');
const aqiDisplayEl = document.getElementById('aqi-display');
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesListEl = document.getElementById('favorites-list');

// State
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();
    updateDate();
    renderFavorites();

    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    themeToggle.addEventListener('click', toggleTheme);
    favoriteBtn.addEventListener('click', toggleFavorite);
});

function toggleFavorite() {
    const city = cityDisplayEl.textContent;
    if (!city || city === '--') return;

    const index = favorites.indexOf(city);
    if (index === -1) {
        favorites.push(city);
        favoriteBtn.textContent = '❤️';
        favoriteBtn.classList.add('active');
    } else {
        favorites.splice(index, 1);
        favoriteBtn.textContent = '🤍';
        favoriteBtn.classList.remove('active');
    }
    
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
}

function renderFavorites() {
    favoritesListEl.innerHTML = '';
    favorites.forEach(city => {
        const chip = document.createElement('div');
        chip.classList.add('fav-chip');
        chip.textContent = city;
        chip.addEventListener('click', () => {
            cityInput.value = city;
            handleSearch();
        });
        favoritesListEl.appendChild(chip);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    // Update chart if it exists
    if (window.myWeatherChart) {
        const chartColor = isDark ? '#e0e5ec' : '#333';
        window.myWeatherChart.data.datasets[0].borderColor = chartColor;
        window.myWeatherChart.data.datasets[0].pointBorderColor = chartColor;
        window.myWeatherChart.options.scales.x.ticks.color = chartColor;
        window.myWeatherChart.options.scales.y.ticks.color = chartColor;
        window.myWeatherChart.update();
    }
}

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        fetchWeatherData();
    } else {
        showError('Please enter a city name.');
    }
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 5000);
}

function showLoading() {
    loadingIndicator.classList.remove('hidden');
    searchBtn.disabled = true;
    errorContainer.classList.add('hidden');
    
    // Reset UI to avoid confusion with previous data
    cityDisplayEl.textContent = '--';
    favoriteBtn.textContent = '🤍';
    favoriteBtn.classList.remove('active');
    currentTempEl.textContent = '--°';
    weatherDescEl.textContent = '--';
    detailedDescEl.textContent = '--';
    predictionDescEl.textContent = '--';
    visibilityEl.textContent = '-- km';
    humidityEl.textContent = '--%';
    sunriseTimeEl.textContent = '--:--';
    sunsetTimeEl.textContent = '--:--';
    aqiDisplayEl.textContent = '--';
    forecastListEl.innerHTML = '';
    
    // Clear chart
    if (window.myWeatherChart) {
        window.myWeatherChart.destroy();
        window.myWeatherChart = null;
    }
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
    searchBtn.disabled = false;
}

async function fetchWeatherData() {
    showLoading();
    try {
        // Fetch Current Weather
        const weatherResponse = await fetch(`${BASE_URL}/weather?q=${currentCity},${COUNTRY_CODE}&units=metric&appid=${API_KEY}`);
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) throw new Error('City not found');
            throw new Error('Failed to fetch current weather');
        }
        const weatherData = await weatherResponse.json();
        updateCurrentWeather(weatherData);

        // Fetch Forecast
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${currentCity},${COUNTRY_CODE}&units=metric&appid=${API_KEY}`);
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
        const forecastData = await forecastResponse.json();
        
        updateHourlyForecast(forecastData);
        updateDailyForecast(forecastData);

        // Fetch Air Quality (3rd Endpoint)
        const { lat, lon } = weatherData.coord;
        const aqiResponse = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        if (!aqiResponse.ok) throw new Error('Failed to fetch air quality');
        const aqiData = await aqiResponse.json();
        updateAirQuality(aqiData);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function updateAirQuality(data) {
    const aqi = data.list[0].main.aqi;
    const aqiText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1] || 'Unknown';
    aqiDisplayEl.textContent = `${aqi} - ${aqiText}`;
}

function updateCurrentWeather(data) {
    cityDisplayEl.textContent = data.name;
    
    // Update Favorite Button State
    if (favorites.includes(data.name)) {
        favoriteBtn.textContent = '❤️';
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.textContent = '🤍';
        favoriteBtn.classList.remove('active');
    }

    currentTempEl.textContent = `${Math.round(data.main.temp)}°`;
    weatherDescEl.textContent = data.weather[0].main;
    
    // Detailed Description
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const descCapitalized = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Simple Beaufort scale for wind description
    const windSpeed = data.wind.speed;
    let windDesc = 'Breezy';
    if (windSpeed < 0.5) windDesc = 'Calm';
    else if (windSpeed < 1.5) windDesc = 'Light air';
    else if (windSpeed < 3.3) windDesc = 'Light breeze';
    else if (windSpeed < 5.5) windDesc = 'Gentle breeze';
    else if (windSpeed < 8) windDesc = 'Moderate breeze';
    else if (windSpeed < 10.8) windDesc = 'Fresh breeze';
    else windDesc = 'Strong wind';

    detailedDescEl.textContent = `Feels like ${feelsLike}°C. ${descCapitalized}. ${windDesc}`;

    visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    humidityEl.textContent = `${data.main.humidity}%`;

    // Sunrise & Sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    
    sunriseTimeEl.textContent = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    sunsetTimeEl.textContent = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function updateHourlyForecast(data) {
    // Get next 8 data points (approx 24 hours)
    const hourlyData = data.list.slice(0, 8);
    
    const labels = hourlyData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    });

    const temps = hourlyData.map(item => Math.round(item.main.temp));

    const ctx = document.getElementById('weatherChart').getContext('2d');
    
    // Destroy existing chart if any
    if (window.myWeatherChart) {
        window.myWeatherChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const chartColor = isDark ? '#e0e5ec' : '#333';

    window.myWeatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: chartColor,
                backgroundColor: 'rgba(0,0,0,0.0)', // Transparent fill
                borderWidth: 2,
                tension: 0.4, // Smooth curve
                pointBackgroundColor: isDark ? '#333' : '#fff',
                pointBorderColor: chartColor,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '°C';
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: true, // Show Y axis for degrees range
                    beginAtZero: false,
                    ticks: {
                        stepSize: 1,
                        color: chartColor
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        font: { size: 10 },
                        color: chartColor
                    }
                }
            }
        }
    });
}

function updateDailyForecast(data) {
    // Pagination state for daily forecast
    window.dailyForecastData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    window.dailyForecastPage = 0;
    const PAGE_SIZE = 3;
    const loadMoreCount = 2;
    const loadMoreForecastBtn = document.getElementById('load-more-forecast');

    function renderDailyForecastPage() {
        forecastListEl.innerHTML = '';
        let end = PAGE_SIZE;
        if (window.dailyForecastPage > 0) {
            end += loadMoreCount;
        }
        const pageData = window.dailyForecastData.slice(0, end);
        pageData.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(day.main.temp);
            const iconCode = day.weather[0].icon;
            const item = document.createElement('div');
            item.classList.add('forecast-item');
            item.innerHTML = `
                <span class="forecast-day">${dayName}</span>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="icon" class="forecast-icon">
                <span class="forecast-temp">${temp}°C</span>
            `;
            forecastListEl.appendChild(item);
        });
        // Show/hide Load More button
        if (end < window.dailyForecastData.length) {
            loadMoreForecastBtn.style.display = '';
        } else {
            loadMoreForecastBtn.style.display = 'none';
        }
    }

    // Generate a simple prediction text
    if (window.dailyForecastData.length > 0) {
        const firstDay = window.dailyForecastData[0];
        const description = firstDay.weather[0].description;
        predictionDescEl.textContent = `Expect ${description} tomorrow.`;
    }

    renderDailyForecastPage();
    loadMoreForecastBtn.onclick = function() {
        window.dailyForecastPage = 1;
        renderDailyForecastPage();
    };
}


// Initialize
// document.addEventListener('DOMContentLoaded', fetchWeatherData);
