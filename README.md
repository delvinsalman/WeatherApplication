# Weather App

A clean, responsive weather application with real-time conditions, hourly and multi-day forecasts, and an Apple-inspired UI. Search any city, switch between light and dark mode (auto by time of day), and view detailed metrics including sun, moon, and air quality.

---

## What It Is

This is a **front-end weather dashboard** that fetches live data from WeatherAPI.com. It shows current weather, feels-like temperature, wind (with direction and gusts), humidity, UV index, visibility, pressure, and air quality. You get a **24-hour hourly forecast**, **3-day** and **7-day** forecast tabs, plus sunrise/sunset, day length, moon phase, moonrise/moonset, and a “Today” summary (max wind, precipitation, snow, average humidity). The layout works on desktop (two-column) and mobile (single column), and the side panel holds search, saved locations, and an interactive map.

---

## Tech Used

| Category | Technology |
|--------|------------|
| **Markup** | HTML5 |
| **Styling** | CSS3 (custom properties, Grid, Flexbox, `backdrop-filter`, responsive breakpoints) |
| **Script** | Vanilla JavaScript (ES6+) |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |
| **Icons** | [Font Awesome 6](https://fontawesome.com/) |
| **Maps** | [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles |
| **Weather data** | [WeatherAPI.com](https://www.weatherapi.com/) (current, forecast, AQI, alerts, astronomy) |

No build step or framework — open `index.html` in a browser or use a local server.

---

## Features

- **Current weather** — Temperature, “feels like”, condition, high/low, location and time
- **Hourly forecast** — Next 24 hours with time, icon, temperature, and chance of rain/snow
- **3-day & 7-day forecast** — Tabs for 3-day and 7-day outlook with condition, rain chance, high/low
- **Details** — Feels like, wind (direction + gusts), chance of rain, humidity, visibility, UV, pressure, air quality
- **Sun & Moon** — Sunrise, sunset, day length, sun up/down; moon phase, illumination, moonrise, moonset, moon visible or not
- **Today summary** — Max wind, precipitation, snow, average humidity for the day
- **Search** — Search icon on home page and in side panel; city search with autocomplete
- **Locations panel** — Saved cities, search, and map for the selected location
- **Dark / light mode** — Automatically follows day/night; readable contrast and no black text in dark mode
- **Alerts** — Weather alerts when provided by the API
- **Responsive layout** — Web-style layout on desktop, single column on small screens

---

## Screenshots

### Main interface (home)

<img width="1503" height="768" alt="Screenshot 2026-02-04 at 2 33 06 PM" src="https://github.com/user-attachments/assets/7952501a-b7ad-43c8-b9a8-b90c45343c54" />

### 3-day forecast

<img width="1503" height="768" alt="Screenshot 2026-02-04 at 2 33 29 PM" src="https://github.com/user-attachments/assets/1c01aa57-e070-43ff-95ca-c09d61171b20" />


### 7-day forecast

<img width="1503" height="768" alt="Screenshot 2026-02-04 at 2 33 37 PM" src="https://github.com/user-attachments/assets/15dc7b6f-a0b9-469e-9ee9-fde9e5146072" />

### Sun, Moon & Today section

<img width="1503" height="768" alt="Screenshot 2026-02-04 at 2 34 26 PM" src="https://github.com/user-attachments/assets/247c2705-59db-450d-b1c3-91ea799d718b" />

### Locations panel (search & map)

<img width="1503" height="768" alt="Screenshot 2026-02-04 at 2 35 03 PM" src="https://github.com/user-attachments/assets/6f79eac7-b06b-400e-ae8f-33b16d0db119" />

---

## How to Run

1. **Get a WeatherAPI key**  
   Sign up at [WeatherAPI.com](https://www.weatherapi.com/signup.aspx) and copy your API key.

2. **Add the key**  
   In `main.js`, set the `API_KEY` constant at the top:
   ```js
   const API_KEY = 'your-api-key-here';
   ```

3. **Open the app**  
   - **Option A:** Double-click `index.html` to open it in your browser.  
   - **Option B:** From the project folder, run a local server, e.g.:
     ```bash
     npx serve
     ```
     Then open the URL shown (e.g. `http://localhost:3000`).

4. **Screenshots for the README**  
   - Create a `screenshots` folder in the project root.  
   - Save your screenshots with the names used above (e.g. `interface.png`, `forecast-3day.png`).  
   - They will show up in this README automatically.

---

## Project structure

```
new-weather-app/
├── index.html      # Single-page app markup
├── style.css       # All styles (layout, theme, components)
├── main.js         # API calls, DOM updates, search, map
├── README.md       # This file
├── screenshots/    # Add your screenshots here (create folder)
├── images/         # Background images (day/night by condition)
│   ├── day/
│   └── night/
└── icons/          # Fallback weather icon
    └── day/
```

---

## API & attribution

- Weather data: [WeatherAPI.com](https://www.weatherapi.com/)
- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/copyright)

If you use the free WeatherAPI plan, they ask for a link back; the app includes “Powered by WeatherAPI.com” in the locations panel.
