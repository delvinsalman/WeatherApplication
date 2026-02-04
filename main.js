const API_KEY = 'YOUR API KEY HERE';
let cityInput = 'Toronto';
let map = null;
let forecastData = null;

const app = document.querySelector('.weather-app');
const loading = document.getElementById('loading');
const panel = document.getElementById('panel');
const panelOverlay = document.getElementById('panel-overlay');
const togglePanelBtn = document.getElementById('toggle-panel');
const closePanelBtn = document.getElementById('close-panel');
const searchOpenBtn = document.getElementById('search-open');
const refreshBtn = document.getElementById('refresh-data');
const form = document.getElementById('locationInput');
const searchInput = document.querySelector('.search');
const searchSuggestions = document.getElementById('search-suggestions');
const citiesGrid = document.getElementById('cities-grid');
const hourlyTrack = document.getElementById('hourly-track');
const forecastList3day = document.getElementById('forecast-list-3day');
const forecastList7day = document.getElementById('forecast-list-7day');
const alertsSection = document.getElementById('alerts-section');
const alertsContainer = document.getElementById('alerts-container');

function showLoading(show) {
    if (show) {
        loading.classList.add('visible');
        app.style.opacity = '0.6';
    } else {
        loading.classList.remove('visible');
        app.style.opacity = '1';
    }
}

function showNotification(message, type = 'info') {
    const root = document.getElementById('notification-root');
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.innerHTML = `
        <span>${message}</span>
        <button class="close-notification" aria-label="Close">&times;</button>
    `;
    el.querySelector('.close-notification').addEventListener('click', () => el.remove());
    root.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
}

function dayName(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function shortDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(str) {
    if (!str) return '—';
    const match = str.match(/\d{2}:\d{2}/);
    return match ? match[0] : str;
}

function parseTimeWithDate(timeStr, dateStr) {
    if (!timeStr || !dateStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    const d = new Date(dateStr);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function formatDuration(minutes) {
    if (minutes == null || isNaN(minutes)) return '—';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
}

function formatHour(timeStr) {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

function getAirQualityText(epaIndex) {
    const map = { 1: 'Good', 2: 'Moderate', 3: 'Unhealthy for sensitive', 4: 'Unhealthy', 5: 'Very unhealthy', 6: 'Hazardous' };
    return map[epaIndex] || '—';
}

function getAirQualityColor(epaIndex) {
    const map = { 1: '#34c759', 2: '#ffcc00', 3: '#ff9500', 4: '#ff3b30', 5: '#af52de', 6: '#98989d' };
    return map[epaIndex] || 'inherit';
}

function openPanel() {
    panel.classList.add('open');
    panelOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closePanel() {
    panel.classList.remove('open');
    panelOverlay.classList.remove('visible');
    document.body.style.overflow = '';
}

togglePanelBtn.addEventListener('click', openPanel);
searchOpenBtn.addEventListener('click', () => {
    openPanel();
    setTimeout(() => searchInput.focus(), 300);
});
closePanelBtn.addEventListener('click', closePanel);
panelOverlay.addEventListener('click', closePanel);

document.querySelectorAll('.forecast-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        const contentId = 'forecast-' + tabId.replace(/-/g, '');
        document.querySelectorAll('.forecast-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.forecast-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const contentEl = document.getElementById(contentId);
        if (contentEl) contentEl.classList.add('active');
    });
});

document.querySelectorAll('.city-card').forEach(card => {
    card.addEventListener('click', () => {
        cityInput = card.getAttribute('data-city') || card.textContent.trim();
        fetchWeatherData();
        closePanel();
        showLoading(true);
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) {
        showNotification('Enter a city or location', 'warning');
        return;
    }
    cityInput = q;
    fetchWeatherData();
    searchInput.value = '';
    searchSuggestions.classList.remove('visible');
    searchSuggestions.innerHTML = '';
    closePanel();
    showLoading(true);
});

let searchDebounce;
searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    const q = searchInput.value.trim();
    if (q.length < 2) {
        searchSuggestions.classList.remove('visible');
        searchSuggestions.innerHTML = '';
        return;
    }
    searchDebounce = setTimeout(() => {
        fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`)
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    searchSuggestions.innerHTML = '<div class="suggestion-item">No results</div>';
                } else {
                    searchSuggestions.innerHTML = data.slice(0, 6).map(loc => `
                        <div class="suggestion-item" data-name="${(loc.name || '').replace(/"/g, '&quot;')}" data-region="${(loc.region || '').replace(/"/g, '&quot;')}" data-country="${(loc.country || '').replace(/"/g, '&quot;')}">
                            ${loc.name}${loc.region ? ', ' + loc.region : ''} · ${loc.country || ''}
                        </div>
                    `).join('');
                    searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                        if (item.dataset.name) {
                            item.addEventListener('click', () => {
                                const name = item.getAttribute('data-name');
                                if (name) cityInput = name;
                                searchInput.value = name || item.textContent.split(' · ')[0];
                                searchSuggestions.classList.remove('visible');
                                fetchWeatherData();
                                closePanel();
                                showLoading(true);
                            });
                        }
                    });
                }
                searchSuggestions.classList.add('visible');
            })
            .catch(() => {
                searchSuggestions.innerHTML = '';
                searchSuggestions.classList.remove('visible');
            });
    }, 300);
});

refreshBtn.addEventListener('click', () => {
    fetchWeatherData();
    showLoading(true);
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => { refreshBtn.style.transform = ''; }, 500);
});

function updateBackground(conditionCode, isDay) {
    const theme = isDay ? 'light' : 'dark';
    app.setAttribute('data-theme', theme);
    let timeOfDay = isDay ? 'day' : 'night';
    const sets = {
        clear: [`./images/${timeOfDay}/clear.jpg`, `./images/${timeOfDay}/clear1.jpg`, `./images/${timeOfDay}/clear2.jpg`],
        cloudy: [`./images/${timeOfDay}/cloudy.jpg`, `./images/${timeOfDay}/cloudy1.jpg`, `./images/${timeOfDay}/cloudy2.jpg`],
        rainy: [`./images/${timeOfDay}/rainy.jpg`, `./images/${timeOfDay}/rainy1.jpg`, `./images/${timeOfDay}/rainy2.jpg`],
        snowy: [`./images/${timeOfDay}/snowy.jpg`, `./images/${timeOfDay}/snowy1.jpg`, `./images/${timeOfDay}/snowy2.jpg`]
    };
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    if (conditionCode === 1000) app.style.backgroundImage = `url(${pick(sets.clear)})`;
    else if ([1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(conditionCode)) app.style.backgroundImage = `url(${pick(sets.cloudy)})`;
    else if ([1063, 1069, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1204, 1207, 1240, 1243, 1246, 1249, 1252].includes(conditionCode)) app.style.backgroundImage = `url(${pick(sets.rainy)})`;
    else app.style.backgroundImage = `url(${pick(sets.snowy)})`;
}

function updateMap(lat, lon) {
    if (map) map.remove();
    const container = document.getElementById('map');
    if (!container) return;
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup(`<b>${cityInput}</b>`).openPopup();
}

function applyCurrentWeather(data) {
    const loc = data.location;
    const cur = data.current;
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
    const localTime = new Date(loc.localtime);

    document.querySelector('.header-location .name').textContent = loc.name;
    document.querySelector('.region-country').textContent = [loc.region, loc.country].filter(Boolean).join(', ') || loc.country || '';

    document.querySelector('.hero-datetime .time').textContent = localTime.toLocaleTimeString('en-US', optionsTime);
    document.querySelector('.hero-datetime .date').textContent = localTime.toLocaleDateString('en-US', optionsDate);

    document.querySelector('.temp-value').textContent = Math.round(cur.temp_c);
    document.querySelector('.condition').textContent = cur.condition.text;
    document.querySelector('.condition-icon').src = 'https:' + cur.condition.icon;
    document.querySelector('.feels-like-value').textContent = Math.round(cur.feelslike_c) + '°';
    document.querySelector('.feels-like-detail').textContent = Math.round(cur.feelslike_c) + '°';

    const windDir = cur.wind_degree != null ? `${cur.wind_dir || ''} ${cur.wind_kph} km/h` : `${cur.wind_kph} km/h`;
    const windStr = cur.gust_kph ? `${windDir} (gusts ${Math.round(cur.gust_kph)} km/h)` : windDir;
    document.querySelector('.wind-detail').textContent = windStr;

    document.querySelector('.humidity-detail').textContent = cur.humidity + '%';
    document.querySelector('.visibility-detail').textContent = cur.vis_km + ' km';
    document.querySelector('.uv-detail').textContent = cur.uv != null ? cur.uv : '—';
    document.querySelector('.pressure-detail').textContent = cur.pressure_mb + ' mb';

    const aqi = cur.air_quality && cur.air_quality['us-epa-index'];
    const aqiEl = document.querySelector('.air-quality-detail');
    aqiEl.textContent = aqi != null ? getAirQualityText(aqi) : '—';
    aqiEl.style.color = aqi != null ? getAirQualityColor(aqi) : '';

    updateBackground(cur.condition.code, cur.is_day === 1);
    updateMap(loc.lat, loc.lon);
}

function applyForecast(forecastDays) {
    forecastData = forecastDays;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDay = forecastDays.find(d => {
        const fd = new Date(d.date);
        fd.setHours(0, 0, 0, 0);
        return fd.getTime() === today.getTime();
    });

    if (todayDay) {
        document.querySelector('.high-temp').textContent = Math.round(todayDay.day.maxtemp_c);
        document.querySelector('.low-temp').textContent = Math.round(todayDay.day.mintemp_c);
        const rainChance = todayDay.day.daily_chance_of_rain != null ? todayDay.day.daily_chance_of_rain : (todayDay.day.daily_chance_of_snow != null ? todayDay.day.daily_chance_of_snow : null);
        document.querySelector('.rain-chance-detail').textContent = rainChance != null ? rainChance + '%' : '—';
    }

    const now = new Date();
    const hours = [];
    for (const day of forecastDays) {
        for (const h of day.hour || []) {
            const hDate = new Date(h.time);
            if (hDate >= now) hours.push(h);
            if (hours.length >= 24) break;
        }
        if (hours.length >= 24) break;
    }

    hourlyTrack.innerHTML = hours.slice(0, 24).map(h => {
        const precip = (h.chance_of_rain || 0) > 0 ? (h.chance_of_rain + '%') : ((h.chance_of_snow || 0) > 0 ? (h.chance_of_snow + '%') : '');
        return `
            <div class="hourly-item">
                <span class="hour">${formatHour(h.time)}</span>
                <img class="hour-icon" src="https:${h.condition.icon}" alt="">
                <span class="hour-temp">${Math.round(h.temp_c)}°</span>
                ${precip ? `<span class="hour-precip">${precip}</span>` : ''}
            </div>
        `;
    }).join('');

    function renderForecastRows(days) {
        return days.map(day => {
            const rainChance = day.day.daily_chance_of_rain != null ? day.day.daily_chance_of_rain : day.day.daily_chance_of_snow;
            return `
                <div class="forecast-row">
                    <span class="forecast-day-name">${dayName(day.date)}</span>
                    <span class="forecast-day-date">${shortDate(day.date)}</span>
                    <div class="forecast-mid">
                        <img src="https:${day.day.condition.icon}" alt="">
                        <span class="forecast-condition-text">${day.day.condition.text}</span>
                    </div>
                    <span class="forecast-rain">${rainChance != null ? rainChance + '%' : '—'}</span>
                    <span class="forecast-temps">${Math.round(day.day.maxtemp_c)}° <span class="low">${Math.round(day.day.mintemp_c)}°</span></span>
                </div>
            `;
        }).join('');
    }

    const threeDays = forecastDays.slice(0, 3);
    const sevenDays = forecastDays.slice(0, 7);
    forecastList3day.innerHTML = renderForecastRows(threeDays);
    forecastList7day.innerHTML = renderForecastRows(sevenDays);

    if (todayDay && todayDay.astro) {
        const astro = todayDay.astro;
        document.querySelector('.sunrise-value').textContent = formatTime(astro.sunrise) || '—';
        document.querySelector('.sunset-value').textContent = formatTime(astro.sunset) || '—';
        document.querySelector('.moon-phase-value').textContent = astro.moon_phase || '—';
        document.querySelector('.moon-illumination').textContent = astro.moon_illumination != null ? astro.moon_illumination + '% illuminated' : '—';
        document.querySelector('.moonrise-value').textContent = formatTime(astro.moonrise) || '—';
        document.querySelector('.moonset-value').textContent = formatTime(astro.moonset) || '—';
        const sunriseDate = parseTimeWithDate(astro.sunrise, todayDay.date);
        const sunsetDate = parseTimeWithDate(astro.sunset, todayDay.date);
        if (sunriseDate && sunsetDate) {
            const dayLengthMins = (sunsetDate - sunriseDate) / (60 * 1000);
            document.querySelector('.day-length-value').textContent = formatDuration(dayLengthMins);
        } else {
            document.querySelector('.day-length-value').textContent = '—';
        }
        document.querySelector('.sun-up-value').textContent = astro.is_sun_up === 1 ? 'Sun is up' : 'Sun is down';
        document.querySelector('.moon-up-value').textContent = astro.is_moon_up === 1 ? 'Moon visible' : 'Moon not visible';
    }
    if (todayDay && todayDay.day) {
        const day = todayDay.day;
        document.querySelector('.today-maxwind-value').textContent = day.maxwind_kph != null ? Math.round(day.maxwind_kph) + ' km/h' : '—';
        document.querySelector('.today-precip-value').textContent = day.totalprecip_mm != null ? day.totalprecip_mm + ' mm' : '0 mm';
        document.querySelector('.today-snow-value').textContent = day.totalsnow_cm != null && day.totalsnow_cm > 0 ? day.totalsnow_cm + ' cm' : '0 cm';
        document.querySelector('.today-humidity-value').textContent = day.avghumidity != null ? day.avghumidity + '%' : '—';
    }
}

function applyAlerts(alerts) {
    if (alerts && alerts.alert && alerts.alert.length > 0) {
        alertsContainer.innerHTML = alerts.alert.map(a => {
            const severe = (a.severity || '').toLowerCase().includes('extreme') || (a.severity || '').toLowerCase().includes('severe');
            return `
                <div class="alert-item ${severe ? 'severe' : ''}">
                    <strong>${a.headline || a.event || 'Alert'}</strong>
                    <p>${(a.desc || '').replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }).join('');
        alertsSection.style.display = 'block';
    } else {
        alertsContainer.innerHTML = '<p class="no-alerts">No active weather alerts.</p>';
        alertsSection.style.display = 'block';
    }
}

function fetchWeatherData() {
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(cityInput)}&aqi=yes`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(cityInput)}&days=7&aqi=yes&alerts=yes`;

    Promise.all([
        fetch(currentUrl).then(r => { if (!r.ok) throw new Error('Location not found'); return r.json(); }),
        fetch(forecastUrl).then(r => { if (!r.ok) throw new Error('Forecast unavailable'); return r.json(); })
    ])
        .then(([currentData, forecastData]) => {
            applyCurrentWeather(currentData);
            applyForecast(forecastData.forecast.forecastday);
            applyAlerts(forecastData.alerts);
            showLoading(false);
            showNotification(`Weather for ${currentData.location.name} updated`, 'success');
        })
        .catch(err => {
            showLoading(false);
            showNotification(err.message || 'Could not load weather', 'error');
        });
}

function init() {
    cityInput = 'Toronto';
    fetchWeatherData();
}

init();
