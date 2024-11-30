let isCelcius = true;
let citySearched = false;
let degreeType = "°C";
let temp = 0;
let tempC = 0;
let tempF = 0;
let isRaining = false;
let iceRain = false;
let isSnowing = false;
let weather = null;
let currentCity = null;
const apiKey = "7ac4970e28324c2a16533429451cd695";

const http = new XMLHttpRequest()
let result = document.querySelector("result")

function findMyCoordinates() {
    navigator.geolocation.getCurrentPosition((position) => {
        const bdcAPI = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`;
        
        // Use a callback to handle when the city is set
        getAPI(bdcAPI, (city) => {
            console.log("City in findMyCoordinates:", city);
            document.getElementById("city").value = city;
            getWeather(); // Fetch weather data only after the city is resolved
        });
    });
}

function getAPI(url, callback) {
    http.open("GET", url);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const results = JSON.parse(this.responseText);
            currentCity = results.locality ? results.locality.toString() : "Unknown";
            console.log("City in getAPI:", currentCity);
            callback(currentCity); // Pass the city to the callback
        }
    };
}

async function fetchWeatherData(city) {
    const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    const url = `${baseUrl}?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        return null;
    }
}

async function getWeather() {
    isRaining = false;
    isSnowing = false;
    iceRain = false;//Default values to false, they are changed as needed later.
    
    const city = document.getElementById("city").value;
    
    if (!city) {
        document.getElementById("weather").innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    const data = await fetchWeatherData(city);
    console.log(data);

    if (data) {
        weather = data.weather[0].description;
        tempC = parseInt(data.main.temp);
        tempF = toFahrenheit(tempC);
        temp = tempC;
        if(!isCelcius){
            temp = tempF;
        }

        if((weather.includes("rain") || data.rain) && (tempC <= 0 || tempF <=32)){
            iceRain = true;
        }

        if (weather.includes("rain") || data.rain){
            isRaining = true;
        }else if(weather.includes("snow")){
            isSnowing = true;
        }
        currentCity = city;
        citySearched = true;
        displayWeather();
    } else {
        document.getElementById("weather").innerHTML = "<p>Could not fetch weather data.</p>";
    }
}

function displayWeather(){
    document.getElementById("weather").innerHTML = `
            <p>City: ${currentCity}</p>
            <p>Temperature: ${temp}°${isCelcius ? "C" : "F"}</p>
            <p>Weather: ${weather}</p>
        `;
}

function suggest(){
    console.log("arrived");
    suggests = document.getElementById("suggestions");
    if(citySearched){ //checks if a city has been searched. need to get weather before suggesting.
        suggests.innerHTML = `
        <button onclick="suggest()">Suggestions</button>
        <p>${isRaining ? "Wear a raincoat and bring an Umbrella!" : "It's not raining so dress for comfort!"}</p>
        <p>${(tempC < 7.5 || tempF < 45) ? "It's pretty chilly out there! Dress warm!" : "It's not super cold! Temp: so dress accordingly"}</p>
        `;    
    }else{
        suggests.innerHTML = `
        <button onclick="suggest()">Suggestions</button>
        <p>You need to search a city first!</p>
        `;
    }
    if(citySearched && isSnowing){
        suggests.innerHTML += `
        <p>It's snowing! Check for cancellations and be cautious on the roads!</p>
        `;
    }
    if(citySearched && iceRain){
        suggests.innerHTML += `
        <p>ICE RAIN WARNING: It is below freezing and raining! Avoid driving if possible!</p>
        `;
    }
}


function toFahrenheit(thisTemp){
    thisTemp = thisTemp*1.8 + 32;
    return(thisTemp);
}

async function switchDeg(){
    isCelcius = !isCelcius;
    if(isCelcius){
        temp = tempC;
        degreeType = "°C";
    }else{
        temp = tempF;
        degreeType = "°F";
    }
    const currentDegType = document.getElementById("degreeType");
    currentDegType.innerHTML = `${isCelcius ? "°C" : "°F"}`;
    displayWeather();
}

window.onload = findMyCoordinates();