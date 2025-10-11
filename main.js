const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time');
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.querySelector('#locationInput');
const search = document.querySelector('.search');
const loading = document.querySelector('.loading');
const threeDayForecast = document.querySelector('.three-day-forecast');
const sevenDayForecast = document.querySelector('.seven-day-forecast');
const mapContainer = document.getElementById('map');
const refreshButton = document.getElementById('refresh-data');
const feelsLikeOutput = document.querySelector('.feels-like-value');
const pressureOutput = document.querySelector('.pressure');
const visibilityOutput = document.querySelector('.visibility');
const dewOutput = document.querySelector('.dew');
const uvOutput = document.querySelector('.uv');
const airQualityOutput = document.querySelector('.air-quality');
const sunriseOutput = document.querySelector('.sunrise');
const sunsetOutput = document.querySelector('.sunset');
const moonOutput = document.querySelector('.moon');
const precipitationOutput = document.querySelector('.precipitation');
const togglePanelButton = document.getElementById('toggle-panel');
const closePanelButton = document.getElementById('close-panel');
const panel = document.querySelector('.panel');
const cityCards = document.querySelectorAll('.city-card');

let cityInput = "Toronto";
let map;

// Event Listeners
cityCards.forEach((card) => {
    card.addEventListener('click', (e) => {
        cityInput = card.getAttribute('data-city');
        fetchWeatherData();
        closePanel();
        app.style.opacity = "0";
        loading.style.display = "flex";
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (search.value.trim().length === 0) {
        showNotification('Please type in a city name', 'warning');
    } else {
        cityInput = search.value.trim();
        fetchWeatherData();
        search.value = "";
        closePanel();
        app.style.opacity = "0";
        loading.style.display = "flex";
    }
});

refreshButton.addEventListener('click', () => {
    fetchWeatherData();
    app.style.opacity = "0.7";
    loading.style.display = "flex";
    
    // Add rotation animation to refresh button
    refreshButton.style.transform = "rotate(360deg)";
    setTimeout(() => {
        refreshButton.style.transform = "rotate(0deg)";
    }, 500);
});

// Panel functionality
togglePanelButton.addEventListener('click', openPanel);
closePanelButton.addEventListener('click', closePanel);

function openPanel() {
    panel.classList.add('active');
    document.body.classList.add('panel-active');
    createOverlay();
}

function closePanel() {
    panel.classList.remove('active');
    document.body.classList.remove('panel-active');
    removeOverlay();
}

function createOverlay() {
    if (!document.querySelector('.panel-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'panel-overlay active';
        overlay.addEventListener('click', closePanel);
        document.body.appendChild(overlay);
    }
}

function removeOverlay() {
    const overlay = document.querySelector('.panel-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Tab functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.forecast-tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Day of the week function
function dayOfTheWeek(day, month, year) {
    const date = new Date(year, month - 1, day);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
}

// Update background based on weather condition
function updateBackground(code, isDay) {
    let timeOfDay = isDay ? "day" : "night";
    
    const clearImages = [
        `./images/${timeOfDay}/clear.jpg`,
        `./images/${timeOfDay}/clear1.jpg`,
        `./images/${timeOfDay}/clear2.jpg`
    ];
    
    const cloudyImages = [
        `./images/${timeOfDay}/cloudy.jpg`,
        `./images/${timeOfDay}/cloudy1.jpg`,
        `./images/${timeOfDay}/cloudy2.jpg`
    ];
    
    const rainyImages = [
        `./images/${timeOfDay}/rainy.jpg`,
        `./images/${timeOfDay}/rainy1.jpg`,
        `./images/${timeOfDay}/rainy2.jpg`
    ];
    
    const snowyImages = [
        `./images/${timeOfDay}/snowy.jpg`,
        `./images/${timeOfDay}/snowy1.jpg`,
        `./images/${timeOfDay}/snowy2.jpg`
    ];
    
    function getRandomImage(images) {
        return images[Math.floor(Math.random() * images.length)];
    }

    if (code === 1000) { // Clear
        app.style.backgroundImage = `url(${getRandomImage(clearImages)})`;
    } else if ([1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(code)) { // Cloudy
        app.style.backgroundImage = `url(${getRandomImage(cloudyImages)})`;
    } else if ([1063, 1069, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1204, 1207, 1240, 1243, 1246, 1249, 1252].includes(code)) { // Rainy
        app.style.backgroundImage = `url(${getRandomImage(rainyImages)})`;
    } else { // Snowy
        app.style.backgroundImage = `url(${getRandomImage(snowyImages)})`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Fetch weather data
function fetchWeatherData() {
    const apiKey = "0087dbec45bd44469b3183723251110";
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityInput}&aqi=yes`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityInput}&days=7&aqi=yes&alerts=yes`;

    // Fetch current weather
    fetch(currentUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not available for this location');
            }
            return response.json();
        })
        .then(data => {
            // Update current weather
            temp.innerHTML = Math.round(data.current.temp_c) + "<span class='degree'>&#176;</span>";
            conditionOutput.innerHTML = data.current.condition.text;
            nameOutput.innerHTML = data.location.name;
            
            // Update date and time
            const localTime = new Date(data.location.localtime);
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const timeOptions = { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            };
            
            dateOutput.innerHTML = localTime.toLocaleDateString('en-US', options);
            timeOutput.innerHTML = localTime.toLocaleTimeString('en-US', timeOptions);
            
            // Update weather details
            cloudOutput.innerHTML = data.current.cloud + "%";
            humidityOutput.innerHTML = data.current.humidity + "%";
            windOutput.innerHTML = data.current.wind_kph + " km/h";
            feelsLikeOutput.innerHTML = Math.round(data.current.feelslike_c) + "°C";
            pressureOutput.innerHTML = data.current.pressure_mb + " mb";
            visibilityOutput.innerHTML = data.current.vis_km + " km";
            uvOutput.innerHTML = data.current.uv;
            dewOutput.innerHTML = Math.round(data.current.dewpoint_c) + "°C";
            
            // Update air quality
            const aqi = data.current.air_quality["us-epa-index"];
            let airQualityText = "Good";
            if (aqi <= 1) airQualityText = "Good";
            else if (aqi <= 2) airQualityText = "Moderate";
            else if (aqi <= 3) airQualityText = "Unhealthy for sensitive groups";
            else if (aqi <= 4) airQualityText = "Unhealthy";
            else if (aqi <= 5) airQualityText = "Very Unhealthy";
            else airQualityText = "Hazardous";
            
            airQualityOutput.innerHTML = airQualityText;
            airQualityOutput.style.color = getAirQualityColor(aqi);
            
            // Update icon
            icon.src = "https:" + data.current.condition.icon;
            
            // Update background
            updateBackground(data.current.condition.code, data.current.is_day);
            
            // Update map
            updateMap(data.location.lat, data.location.lon);
            
            // Show app content
            setTimeout(() => {
                app.style.opacity = "1";
                loading.style.display = "none";
            }, 1000);
            
            // Show success notification
            showNotification(`Weather data for ${data.location.name} updated successfully`, 'success');
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            showNotification(error.message, 'error');
            loading.style.display = "none";
            app.style.opacity = "1";
        });

    // Fetch forecast data
    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(data => {
            // Update forecast
            updateForecast(data.forecast.forecastday);
            
            // Update additional details
            const today = data.forecast.forecastday[0];
            sunriseOutput.innerHTML = today.astro.sunrise;
            sunsetOutput.innerHTML = today.astro.sunset;
            moonOutput.innerHTML = today.astro.moon_phase;
            precipitationOutput.innerHTML = today.day.totalprecip_mm + " mm";
            
            // Update alerts if any
            updateAlerts(data.alerts);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            showNotification('Could not load forecast data', 'warning');
        });
}

// Update forecast display - FIXED VERSION
function updateForecast(forecastDays) {
    // Clear previous forecast
    threeDayForecast.innerHTML = '';
    sevenDayForecast.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    // Filter out today's date and only show future days
    const futureDays = forecastDays.filter(day => {
        const forecastDate = new Date(day.date);
        forecastDate.setHours(0, 0, 0, 0);
        return forecastDate > today;
    });
    
    // Update 3-day forecast (next 3 days)
    const threeDayForecastData = futureDays.slice(0, 3);
    threeDayForecastData.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const forecastElement = document.createElement('div');
        forecastElement.className = 'forecast-day';
        forecastElement.innerHTML = `
            <div class="forecast-date">${dayName}<br><small>${monthDay}</small></div>
            <div class="forecast-condition">
                <img src="https:${day.day.condition.icon}" 
                     class="forecast-icon" alt="${day.day.condition.text}">
                <span>${day.day.condition.text}</span>
            </div>
            <div class="forecast-temp">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</div>
        `;
        
        threeDayForecast.appendChild(forecastElement);
    });
    
    // Update 7-day forecast (next 7 days)
    const sevenDayForecastData = futureDays.slice(0, 7);
    sevenDayForecastData.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const forecastElement = document.createElement('div');
        forecastElement.className = 'forecast-day';
        forecastElement.innerHTML = `
            <div class="forecast-date">${dayName}<br><small>${monthDay}</small></div>
            <div class="forecast-condition">
                <img src="https:${day.day.condition.icon}" 
                     class="forecast-icon" alt="${day.day.condition.text}">
                <span>${day.day.condition.text}</span>
            </div>
            <div class="forecast-temp">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</div>
        `;
        
        sevenDayForecast.appendChild(forecastElement);
    });
    
    // If no forecast data available, show message
    if (threeDayForecastData.length === 0) {
        threeDayForecast.innerHTML = '<div class="no-forecast">No forecast data available</div>';
    }
    if (sevenDayForecastData.length === 0) {
        sevenDayForecast.innerHTML = '<div class="no-forecast">No forecast data available</div>';
    }
}

// Update weather alerts
function updateAlerts(alerts) {
    const alertsContainer = document.querySelector('.alerts-container');
    
    if (alerts.alert && alerts.alert.length > 0) {
        let alertsHTML = '';
        alerts.alert.forEach(alert => {
            alertsHTML += `
                <div class="alert-message" style="background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
                    <div style="flex: 1; margin-left: 10px;">
                        <strong>${alert.headline}</strong>
                        <p style="margin: 5px 0 0; font-size: 0.9rem;">${alert.desc}</p>
                    </div>
                </div>
            `;
        });
        alertsContainer.innerHTML = alertsHTML;
    } else {
        alertsContainer.innerHTML = `
            <div class="alert-message">
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                <span>No active weather alerts for this location</span>
            </div>
        `;
    }
}

// Get air quality color
function getAirQualityColor(aqi) {
    if (aqi <= 1) return "#28a745"; // Good - Green
    if (aqi <= 2) return "#ffc107"; // Moderate - Yellow
    if (aqi <= 3) return "#fd7e14"; // Unhealthy for sensitive groups - Orange
    if (aqi <= 4) return "#dc3545"; // Unhealthy - Red
    if (aqi <= 5) return "#6f42c1"; // Very Unhealthy - Purple
    return "#000000"; // Hazardous - Black
}

// Update map
function updateMap(lat, lon) {
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([lat, lon], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${cityInput}</b><br>Current location`)
        .openPopup();
}

// Initialize app
function initApp() {
    cityInput = "Toronto";
    fetchWeatherData();
}

// Start the app
initApp();