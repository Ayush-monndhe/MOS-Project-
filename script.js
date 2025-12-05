const API_KEY = "f8fb29ddd3398df48bcfc503d3247630";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("status");

async function fetchWeather(city = "") {
  try {
    errorEl.style.display = "none";
    statusEl.textContent = "Fetching weather...";

    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    } else {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      const { latitude, longitude } = pos.coords;
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found!");
    const data = await response.json();

    displayCurrent(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "⚠️ " + err.message;
    errorEl.style.display = "block";
    statusEl.textContent = "Error";
  }
}

async function fetchForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    displayForecast(data.list);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "⚠️ Unable to load forecast data.";
    errorEl.style.display = "block";
  } finally {
    statusEl.textContent = "Ready";
  }
}

function displayCurrent(data) {
  document.getElementById("city").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("desc").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;

  const icon = data.weather[0].icon;
  const iconImg = document.getElementById("iconImg");
  iconImg.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  iconImg.style.display = "block";
}

function displayForecast(list) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  // Show 1 forecast every 8 intervals (8*3h = 24h)
  for (let i = 0; i < list.length; i += 8) {
    const item = list[i];
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;

    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.innerHTML = `
      <p>${day}</p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
      <p>${temp}°C</p>
      <p>${item.weather[0].main}</p>
    `;
    forecastContainer.appendChild(div);
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

locBtn.addEventListener("click", () => fetchWeather());
