isCelcius = true;
temp;
tempC;
tempF;
isRaining;
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
        if (weather.includes("rain") || data.rain){
            isRaining = true;
        }else{
            isRaining = false;
        }
        currentCity = city;
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
            <p>Is it raining? ${isRaining ? "Yes, bring an umbrella!" : "No, it’s not raining."}</p>
        `;
}


function toFahrenheit(thisTemp){
    thisTemp = thisTemp*1.8 + 32;
    return(thisTemp);
}

async function switchDeg(){
    isCelcius = !isCelcius;
    if(isCelcius){
        temp = tempC;
    }else{
        temp = tempF;
    }
    const currentDegType = document.getElementById("degreeType");
    currentDegType.innerHTML = `${isCelcius ? "°C" : "°F"}`;
    displayWeather();
}

