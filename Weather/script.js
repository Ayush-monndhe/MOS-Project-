async function getForecast() {
  const city = document.getElementById("city").value.trim();
  const apiKey = "d1df8b42dc29b78753a8f57fa737bb03";
  const forecastDiv = document.getElementById("forecast");

  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  forecastDiv.innerHTML = "<p>Loading...</p>";

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") {
      forecastDiv.innerHTML = "<p>City not found!</p>";
      return;
    }

    const dailyData = [];
    for (let i = 0; i < data.list.length; i += 8) { // every 24h (8*3h)
      dailyData.push(data.list[i]);
    }

    forecastDiv.innerHTML = "";
    dailyData.slice(0, 5).forEach(day => {
      const date = new Date(day.dt * 1000).toDateString();
      const temp = Math.round(day.main.temp);
      const desc = day.weather[0].description;
      const icon = getWeatherEmoji(desc);

      const card = `
        <div class="weather-card">
          <h3>${date.split(" ").slice(0, 3).join(" ")}</h3>
          <p style="font-size:24px">${icon}</p>
          <p>${temp}°C</p>
          <p>${desc}</p>
        </div>
      `;
      forecastDiv.innerHTML += card;
    });

  } catch (error) {
    forecastDiv.innerHTML = "<p>Error fetching data!</p>";
  }
}

// Simple emoji mapping
function getWeatherEmoji(desc) {
  desc = desc.toLowerCase();
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("clear")) return "☀️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("storm")) return "⛈️";
  if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
  return "🌤️";
}
