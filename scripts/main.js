class Weather {
    constructor(tempC = 0, tempF = 0, conditions = "") {
        this.tempC = tempC;
        this.tempF = tempF;
        this.conditions = conditions;
        this.isRaining = false;
        this.isSnowing = false;
        this.iceRain = false;
    }

    updateWeather(data) {
        this.tempC = parseInt(data.main.temp);
        this.tempF = this.toFahrenheit(this.tempC);
        this.conditions = data.weather[0].description.toLowerCase();

        // Determine weather conditions
        this.isRaining = this.conditions.includes("rain") || data.rain;
        this.isSnowing = this.conditions.includes("snow");
        this.iceRain = this.isRaining && this.tempC <= 0;


        const header = document.querySelector(".header");
        const leftCol = document.querySelector(".left-column");
        const rightCol = document.querySelector(".right-column");
        const container = document.querySelector(".container");
       

        const root = document.documentElement; // Get the root element to set CSS variables

        let color, hoverColor;
        if (this.isSnowing) {
            color = "#ADD8E6"; // Light blue for snow
            hoverColor = "#87B8D4"; // Slightly darker blue
        } else if (this.isRaining) {
            color = "#A9A9A9"; // Gray for rain
            hoverColor = "#8F8F8F"; // Slightly darker gray
        } else if (this.iceRain) {
            color = "#E0FFFF"; // Light cyan for ice rain
            hoverColor = "#B2DFFF"; // Slightly darker cyan
        } else {
            color = "#007BFF"; // Default blue
            hoverColor = "#0056b3"; // Slightly darker blue 000000
        }
    
        // Update header and column colors
        header.style.backgroundColor = color;
        leftCol.style.backgroundColor = color;
        rightCol.style.backgroundColor = color;
    

        // Set the hover color dynamically
        root.style.setProperty("--button-bg-color", color);
        root.style.setProperty("--button-hover-color", hoverColor);


        const currentTime = new Date();
        const hour = currentTime.getHours();

        let containerColor;
         if(hour >=6 && hour < 12){
            // Morning
            containerColor = "#FFFACD";


         }else if(hour >= 12 && hour < 18){
            // Day
            containerColor = "#F0E68C";

         }else{
            // Night
            containerColor = "#2F4F4F";
         }

         container.style.backgroundColor = containerColor;
    }

    toFahrenheit(tempC) {
        return tempC * 1.8 + 32;
    }
}

class Suggestion {
    constructor() {
        this.icyRoads = false;
        this.wearRaincoat = false;
        this.wearWarmClothes = false;
        this.freezing = false;
    }

    updateSuggestions(weather) {
        this.icyRoads = weather.iceRain;
        this.wearRaincoat = weather.isRaining;
        this.wearWarmClothes = weather.tempC < 7.5;
        this.freezing = weather.tempC < 0;
    }

    generateSuggestionText() {
        let suggestions = [];
        if (this.wearRaincoat) suggestions.push("Wear a raincoat and bring an umbrella!");
        if(this.freezing){
            suggestions.push("It's below freezing out there! Dress extra warm!");
        }
        else if (this.wearWarmClothes){
            suggestions.push("It's pretty chilly out there! Dress warm!");
        } 
        if (this.icyRoads) suggestions.push("ICE RAIN WARNING: Avoid driving if possible!");
                if (!this.wearRaincoat && !this.wearWarmClothes && !this.icyRoads) {
            suggestions.push("It's a nice day! Dress comfortably.");
        }
        return suggestions.join("<br>");
    }
}

class Location {
    constructor(city = "", time = new Date(), weather = new Weather(), suggestion = new Suggestion()) {
        this.city = city;
        this.time = time;
        this.weather = weather;
        this.suggestion = suggestion;
    }

    async fetchWeatherData(apiKey) {
        const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
        const url = `${baseUrl}?q=${this.city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);
            const data = await response.json();

            this.weather.updateWeather(data);
            this.suggestion.updateSuggestions(this.weather);
            this.time = new Date();
            console.log(this.time);
            return true;
        } catch (error) {
            console.error("Error fetching weather data:", error.message);
            return false;
        }
    }
}

// Global Variables
const apiKey = "7ac4970e28324c2a16533429451cd695";
let currentLocation = new Location();
let isCelcius = true;

// DOM Updates
function displayWeather() {
    document.getElementById("weather").innerHTML = `
        <p>City: ${currentLocation.city}</p>
        <p>Temperature: ${isCelcius ? currentLocation.weather.tempC : currentLocation.weather.tempF}°${isCelcius ? "C" : "F"}</p>
        <p>Weather: ${currentLocation.weather.conditions}</p>
    `;
}

function displaySuggestions() {
    document.getElementById("suggestions").innerHTML = `
        <button onclick="displaySuggestions()">Suggestions</button>
        <p>${currentLocation.suggestion.generateSuggestionText()}</p>
    `;
}

// Core Functions
async function findMyCoordinates() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const bdcAPI = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`;
        const response = await fetch(bdcAPI);
        const data = await response.json();
        currentLocation.city = data.locality || "Unknown";

        console.log("City detected:", currentLocation.city);

        const weatherFetched = await currentLocation.fetchWeatherData(apiKey);
        if (weatherFetched) {
            displayWeather();
        } else {
            document.getElementById("weather").innerHTML = "<p>Could not fetch weather data.</p>";
        }
    });
}

async function getWeather() {
    const city = document.getElementById("city").value;
    if (!city) {
        document.getElementById("weather").innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    currentLocation.city = city;
    const weatherFetched = await currentLocation.fetchWeatherData(apiKey);
    if (weatherFetched) {
        displayWeather();
    } else {
        document.getElementById("weather").innerHTML = "<p>Could not fetch weather data.</p>";
    }
}

function switchDeg() {
    isCelcius = !isCelcius;
    displayWeather();
}

// Initialize
window.onload = findMyCoordinates;
