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

        this.tempC = parseInt(data.main.temp);
        this.conditions = data.weather[0].description.toLowerCase();
        this.updateWeatherImage(this.conditions);


    }

    updateWeatherImage(weatherCondition){
        const weatherImage = document.getElementById("weather-image");
        const weatherBox = document.getElementById("weather-box");
        let imageUrl;
        let backgroundColor;
    
    
        if (weatherCondition.includes("clear")) {
            imageUrl = "./img/sunny.png"; // Replace with your image path
            backgroundColor = "rgba(250, 228, 103, 0.6)";
        } else if (weatherCondition.includes("cloud")) {
            imageUrl = "./img/cloudy.png"; // Replace with your image path
            backgroundColor = "rgba(250, 243, 205, 0.6)";
        } else if (weatherCondition.includes("rain")) {
            imageUrl = "./img/raininging.png"; // Replace with your image path
            backgroundColor = "rgba(99, 132, 163, 0.6)";
        } else if (weatherCondition.includes("snow")) {
            imageUrl = "./img/sunny.png"; // Replace with your image path
            backgroundColor = "rgba(211, 230, 252, 0.9)";
        } else if (eatherCondition.includes("lightning") || weatherCondition.includes("storm")) {
            imageUrl = "./img/lightning.png"; // Replace with your image path
             backgroundColor = "rgba(99, 132, 163, 0.6)";
        } else {
            imageUrl = "./img/sunny.png"; // Default image
           backgroundColor = "rgba(250, 228, 103, 0.6)";
        }
    
        weatherImage.src = imageUrl;
        weatherBox.style.backgroundColor = backgroundColor;
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
    
    const cityName = document.getElementById("city-name");
    const temperature = document.getElementById("temperature");
    const weatherCondition = document.getElementById("weather-condition");


    cityName.textContent = `City: ${currentLocation.city}`;
    weatherCondition.textContent = `${currentLocation.weather.conditions}`;
    temperature.textContent = `${isCelcius ? currentLocation.weather.tempC : currentLocation.weather.tempF}°${isCelcius ? "C" : "F"}`;
    

    const weatherbox = document.getElementById("weather-box");
    
    weatherbox.classList.remove("hidden");
    
    /*
    const weatherData =`
    <p id="city-name">City: ${currentLocation.city}</p>
            <p id="temperature">Temperature: ${isCelcius ? currentLocation.weather.tempC : currentLocation.weather.tempF}°${isCelcius ? "C" : "F"}</p>
            <p id="weather-condition">Weather: ${currentLocation.weather.conditions}</p>
            <button onclick="switchDeg()">Switch C/F</button>

                <div id="suggestions">
                    <button onclick="displaySuggestions()">Suggestions</button>
                </div>
    `;

    // Have to make the weatherbox visible before you can access it's ID
   

    document.getElementById("weather-box").innerHTML = weatherData;
    */
    
}

function displaySuggestions() {

    const suggestionText = currentLocation.suggestion.generateSuggestionText();

    document.getElementById("suggestion-text").innerHTML = `<p>${suggestionText}</p>`

   // document.getElementById("suggestions").innerHTML = `
   //     <button onclick="displaySuggestions()">Suggestions</button>
     //   <p1>${currentLocation.suggestion.generateSuggestionText()}</p1>
   // `;
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
            document.getElementById("weather-box").innerHTML = "<p>Could not fetch weather data.</p>";
        }
    });
}


    
    async function getWeather() {
        const city = document.getElementById("city").value;
        if (!city) {
            const errorDiv = document.getElementById("error-message");
            errorDiv.textContent = "Please enter a city name.";
            errorDiv.style.display = "block"; // Make the error message visible
            return;
        }
    
        
    
        currentLocation.city = city;
        const weatherFetched = await currentLocation.fetchWeatherData(apiKey);
        const errorDiv = document.getElementById("error-message");

        if (weatherFetched) {

            errorDiv.textContent ="";
            errorDiv.style.display="none";
            
            
            const cityName = document.getElementById("city-name");
            const temperature = document.getElementById("temperature");
            const weatherCondition = document.getElementById("weather-condition");


            cityName.textContent = `City: ${currentLocation.city}`;
            weatherCondition.textContent = `${currentLocation.weather.conditions}`;
            temperature.textContent = `${isCelcius ? currentLocation.weather.tempC : currentLocation.weather.tempF}°${isCelcius ? "C" : "F"}`;
            

            const weatherbox = document.getElementById("weather-box");
            
            weatherbox.classList.remove("hidden");
            
            
    
    
        } else {
             // Display error message for invalid city
        errorDiv.textContent = "City does not exist or could not fetch weather data. Check spelling and try again";
        errorDiv.style.display = "block"; // Make the error message visible
        }
    
    }
    



function switchDeg() {
    isCelcius = !isCelcius;
    displayWeather();
}

// Initialize
window.onload = findMyCoordinates;
