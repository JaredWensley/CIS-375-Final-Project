isCelcius = true;
citySearched = false;
degreeType = "°C";
temp;
tempC;
tempF;
isRaining;
iceRain;
isSnowing;
weather;
currentCity;

async function fetchWeatherData(city, apiKey) {
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
    
    const apiKey = "7ac4970e28324c2a16533429451cd695"; // Replace with your API key
    const city = document.getElementById("city").value;
    
    if (!city) {
        document.getElementById("weather").innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    const data = await fetchWeatherData(city, apiKey);
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

