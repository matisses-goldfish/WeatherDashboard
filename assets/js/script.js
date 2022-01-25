// script and the use of axios is modeled after:
// Sylvia Prabudy https://github.com/sylviaprabudy/weather-dashboard
// Ryan Ellingson https://github.com/RyanEllingson/Weather-Dashboard/blob/master/assets/js/script.js
// Kimcc https://github.com/kimcc/weather-dashboard

function initPage() {

    // document const targets and changes elements based on API data
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const locationHistory = document.getElementById('locationHistory');
    const locationName = document.getElementById('locationName');
    const openWeatherIcon = document.getElementById('openWeatherIcon');
    const mainTemp = document.getElementById('mainTemp');
    const mainHumidity = document.getElementById('mainHumidity');
    const mainWind = document.getElementById('mainWind');
    const mainIndex = document.getElementById('mainIndex');
    const clearBtn = document.getElementById('clearBtn');

    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    const APIKey = "85de5af9399d565d7475e27094d9743a"

// the initial API call, that employed the search input and API key provided by Open Weather Map
    function fetchWeather(cityInput) {
        let openWeatherAPI = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + APIKey;
        console.log (openWeatherAPI);
        axios.get(openWeatherAPI)
            .then(function (response) {
                // Current Weather that displays the city name, weather icon, temperature, humidity, and wind speeds.  
                locationName.innerHTML = response.data.name
                const openIcon = response.data.weather[0].icon;
                openWeatherIcon.setAttribute("src", "https://openweathermap.org/img/wn/" + openIcon + "@2x.png");
                openWeatherIcon.setAttribute("alt", response.data.weather[0].description);
                mainTemp.innerHTML = k2f(response.data.main.temp) + " &#176F";
                mainHumidity.innerHTML = response.data.main.humidity + "%";
                mainWind.innerHTML = response.data.wind.speed + " MPH";

                // the UV is called with the use of latitude and longitude
                let lat = response.data.coord.lat;
                    let lon = response.data.coord.lon;
                    let openWeatherUV = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                    console.log (openWeatherUV);
                    axios.get(openWeatherUV)
                        .then(function (response) {                            
                            if (response.data[0].value < 2 ) {
                                mainIndex.setAttribute("class", "uv-good");
                            }
                            else if (response.data[0].value < 5) {
                                mainIndex.setAttribute("class", "uv-medium");
                            }
                            else {
                                mainIndex.setAttribute("class", "uv-bad");
                            }
                            console.log(openWeatherUV)
                            mainIndex.innerHTML = response.data[0].value;
                            
                        });
                
                        // Five day Forecast that takes the inner html of a forecast card and creates text based on the API call paramaters
                        let cityData = response.data.id;
                        let OWForecastAPI = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityData + "&appid=" + APIKey;
                        axios.get(OWForecastAPI)
                            .then(function (response) {
                                var forecastEls = document.querySelectorAll("#forecastCard");
                                for (i = 0; i < forecastEls.length; i++) {
                                    forecastEls[i].innerHTML = "";
                                    var fivedayIndex = i * 8 + 4;
                                    var fivedayDate = new Date(response.data.list[fivedayIndex].dt * 1000);
                                    var fivedayDay = fivedayDate.getDate();
                                    var fivedayDEL = document.createElement("p");
                                    fivedayDEL.setAttribute("class", "mb-0 justify-content-center");
                                    fivedayDEL.innerHTML = fivedayDay;
                                    forecastEls[i].append(fivedayDEL);
        
                                    var fivedayEl = document.createElement("img");
                                    fivedayEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[fivedayIndex].weather[0].icon + "@2x.png");
                                    fivedayEl.setAttribute("alt", response.data.list[fivedayIndex].weather[0].description);
                                    forecastEls[i].append(fivedayEl);
                                    var fivedayTemp = document.createElement("h4");
                                    fivedayTemp.innerHTML = k2f(response.data.list[fivedayIndex].main.temp) + " &#176F";
                                    forecastEls[i].append(fivedayTemp);
                                    var fivedayHumidity = document.createElement("h4");
                                    fivedayHumidity.innerHTML = "Humidity: " + response.data.list[fivedayIndex].main.humidity + "%";
                                    forecastEls[i].append(fivedayHumidity);
                                }
                            })
                    });
            }
            // stringifys the search input, which prevents the api call from erroring out of its desired application
            searchBtn.addEventListener("click", function () {
                const searchInput = cityInput.value;
                fetchWeather(searchInput);
                searchHistory.push(searchInput);
                localStorage.setItem("search", JSON.stringify(searchHistory));
                renderSearchHistory();
            })

            // clears local history
            clearBtn.addEventListener("click", function () {
                localStorage.clear();
                searchHistory = [];
                renderSearchHistory();
            })

            function k2f(K) {
                return Math.floor((K - 273.15) * 1.8 + 32);
            }

        // this appends the search history below the search bar, and, 
        // when click, allows them to display the weather conditions for that location
            function renderSearchHistory() {
                locationHistory.innerHTML = "";
                for (let i = 0; i < searchHistory.length; i++) {
                    const pastCity = document.createElement("input");
                    pastCity.setAttribute("type", "text");
                    pastCity.setAttribute("readonly", true);
                    pastCity.setAttribute("class", "form-control d-block bg-white");
                    pastCity.setAttribute("value", searchHistory[i]);
                    pastCity.addEventListener("click", function () {
                        fetchWeather(pastCity.value);
                    })
                    locationHistory.append(pastCity);
                }
            }

        // Take the last search term used and automatically inputs it as the default weather
            renderSearchHistory();
            if (searchHistory.length > 0) {
                fetchWeather(searchHistory[searchHistory.length - 1]);
            }
            
     }
    initPage();
