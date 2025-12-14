# Weather App

A comprehensive weather dashboard that provides real-time weather information and visualizations.

## API Documentation

### 1. Base URL
`https://api.openweathermap.org/data/2.5`

### 2. Endpoints
-   **Current Weather**: `/weather` - Gets current weather data.
-   **5 Day Forecast**: `/forecast` - Gets 5-day weather forecast.
-   **Air Pollution**: `/air_pollution` - Gets air quality data.

### 3. Required Parameters
-   `q`: City name (e.g., "London").
-   `lat` & `lon`: Latitude and Longitude (for Air Pollution).
-   `appid`: Your unique API Key.
-   `units`: Unit of measurement (e.g., `metric`).

### 4. Authentication
-   **Type**: API Key
-   **Method**: Query Parameter (`appid=YOUR_API_KEY`)

### 5. Sample JSON Response (Current Weather)
```json
{
  "coord": { "lon": 120.34, "lat": 16.04 },
  "weather": [
    {
      "id": 803,
      "main": "Clouds",
      "description": "broken clouds",
      "icon": "04d"
    }
  ],
  "main": {
    "temp": 30.5,
    "feels_like": 33.2,
    "humidity": 65
  },
  "name": "Dagupan"
}
```

## Features

-   **City Search**: Search for weather conditions in any city (e.g., "Baguio").
-   **Current Weather**: Displays current temperature, weather condition, and location.
-   **Air Quality**: Displays current Air Quality Index (AQI).
-   **Sun Cycle**: Shows Sunrise and Sunset times.
-   **Data Visualization**: Includes a chart (using Chart.js) to visualize weather trends.
-   **Theme Toggle**: Switch between Light and Dark modes.
-   **Responsive Design**: Split-panel layout for desktop and responsive adjustments for mobile.

## Technologies Used

-   HTML5
-   CSS3
-   JavaScript
-   Chart.js (for data visualization)
-   OpenWeatherMap API

## How to Use

1.  Open `index.html` in your web browser.
2.  Enter a city name in the search box and click **Search**.
3.  View the current weather details, air quality, and charts on the dashboard.
4.  Toggle the theme using the moon/sun icon in the header.
