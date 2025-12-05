const KEY = "f8fb29ddd3398df48bcfc503d3247630";
const cityInput = document.getElementById("place");
const goBtn = document.getElementById("getWeather");
const geoBtn = document.getElementById("geoBtn");
const msg = document.getElementById("msg");

async function loadWeather(city = "") {
  try {
    msg.classList.add("hidden");
    const url = city
      ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${KEY}`
      : await getGeoUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found!");
    const data = await res.json();
    showCurrent(data);
    await loadForecast(data.coord.lat, data.coord.lon);
  } catch (e) {
    msg.textContent = e.message;
    msg.classList.remove("hidden");
  }
}

async function getGeoUrl() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        resolve(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${KEY}`);
      },
      () => reject(new Error("Geolocation blocked"))
    );
  });
}

function showCurrent(data) {
  document.getElementById("now").classList.remove("hidden");
  document.getElementById("nextTitle").classList.remove("hidden");

  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("tempNow").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("condition").textContent = data.weather[0].description;
  document.getElementById("humidityNow").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("windNow").textContent = `Wind: ${data.wind.speed} m/s`;

  const icon = document.getElementById("iconNow");
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  icon.classList.remove("hidden");
}

async function loadForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const grid = document.getElementById("nextDays");
  grid.innerHTML = "";
  for (let i = 0; i < data.list.length; i += 8) {
    const day = data.list[i];
    const date = new Date(day.dt * 1000);
    const name = date.toLocaleDateString("en-US", { weekday: "short" });
    grid.innerHTML += `
      <div class="day">
        <p>${name}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
        <p>${Math.round(day.main.temp)}°C</p>
        <p>${day.weather[0].main}</p>
      </div>
    `;
  }
}

goBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) loadWeather(city);
});

geoBtn.addEventListener("click", () => loadWeather());
