// ==================================================
// BASIC HELPERS
// ==================================================

function getElement(selector) {
  return document.querySelector(selector);
}

function setText(selector, value) {
  const element = getElement(selector);

  if (element) {
    element.textContent = value;
  }
}


// ==================================================
// CLOCK
// ==================================================

function updateClock() {
  const now = new Date();

  const formatted = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }
  ).format(now);

  setText("#central-time", formatted);
}

updateClock();
setInterval(updateClock, 30000);


// ==================================================
// WEATHER CONFIG
// ==================================================

const latitude = 33.45;
const longitude = -88.82;
const weatherRefreshMinutes = 10;


// ==================================================
// WEATHER DESCRIPTION
// ==================================================

function getWeatherDescription(code) {
  if (code === 0) return "CLEAR";
  if (code === 1) return "MAINLY CLEAR";
  if (code === 2) return "PARTLY CLOUDY";
  if (code === 3) return "OVERCAST";

  if (code === 45 || code === 48) {
    return "FOG";
  }

  if (code >= 51 && code <= 57) {
    return "DRIZZLE";
  }

  if (code >= 61 && code <= 67) {
    return "RAIN";
  }

  if (code >= 71 && code <= 77) {
    return "SNOW";
  }

  if (code >= 80 && code <= 82) {
    return "RAIN SHOWERS";
  }

  if (code === 85 || code === 86) {
    return "SNOW SHOWERS";
  }

  if (code === 95) {
    return "THUNDERSTORM";
  }

  if (code === 96 || code === 99) {
    return "SEVERE THUNDERSTORM";
  }

  return "VARIABLE";
}


// ==================================================
// WEATHER CATEGORY
// ==================================================

function getWeatherCategory(code) {
  if (code === 0 || code === 1) {
    return "clear";
  }

  if (
    code === 2 ||
    code === 3 ||
    code === 45 ||
    code === 48
  ) {
    return "cloudy";
  }

  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)
  ) {
    return "rain";
  }

  if (
    (code >= 71 && code <= 77) ||
    code === 85 ||
    code === 86
  ) {
    return "snow";
  }

  if (code >= 95) {
    return "storm";
  }

  return "cloudy";
}


// ==================================================
// WIND DIRECTION
// ==================================================

function getWindDirection(degrees) {
  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW"
  ];

  const index =
    Math.round(degrees / 45) % 8;

  return directions[index];
}


// ==================================================
// TIME FORMATTER
// ==================================================

function formatWeatherTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );
}


// ==================================================
// LIVE WEATHER
// ==================================================

async function getWeather() {
  try {
    const weatherURL =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + latitude +
      "&longitude=" + longitude +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure" +
      "&daily=sunrise,sunset" +
      "&temperature_unit=fahrenheit" +
      "&wind_speed_unit=mph" +
      "&timezone=America%2FChicago";

    const response =
      await fetch(weatherURL);

    if (!response.ok) {
      throw new Error(
        "Weather request failed: " +
        response.status
      );
    }

    const data =
      await response.json();

    const weather =
      data.current;

    const temperature =
      Math.round(weather.temperature_2m);

    const description =
      getWeatherDescription(
        weather.weather_code
      );

    setText(
      "#temperature",
      temperature
    );

    setText(
      "#station-temperature",
      temperature
    );

    setText(
      "#weather-description",
      description
    );

    setText(
      "#station-condition",
      description
    );

    setText(
      "#feels-like",
      Math.round(
        weather.apparent_temperature
      ) + "°"
    );

    setText(
      "#humidity",
      weather.relative_humidity_2m + "%"
    );

    setText(
      "#dew-point",
      Math.round(
        weather.dew_point_2m
      ) + "°"
    );

    setText(
      "#cloud-cover",
      weather.cloud_cover + "%"
    );

    setText(
      "#wind",
      Math.round(
        weather.wind_speed_10m
      ) + " mph"
    );

    setText(
      "#gust",
      Math.round(
        weather.wind_gusts_10m
      ) + " mph"
    );

    setText(
      "#pressure",
      Math.round(
        weather.surface_pressure
      ) + " hPa"
    );

    const visibilityMiles =
      weather.visibility /
      1609.344;

    setText(
      "#visibility",
      visibilityMiles.toFixed(1) +
      " mi"
    );

    setText(
      "#wind-direction",
      getWindDirection(
        weather.wind_direction_10m
      )
    );

    if (
      data.daily &&
      data.daily.sunrise &&
      data.daily.sunset
    ) {
      setText(
        "#sunrise",
        formatWeatherTime(
          data.daily.sunrise[0]
        )
      );

      setText(
        "#sunset",
        formatWeatherTime(
          data.daily.sunset[0]
        )
      );
    }

    const updatedTime =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "America/Chicago",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }
      ).format(new Date());

    setText(
      "#weather-updated",
      "UPDATED " +
      updatedTime
    );

    document.body.dataset.weather =
      getWeatherCategory(
        weather.weather_code
      );
  }

  catch (error) {
    console.error(
      "Weather failed to load:",
      error
    );

    setText(
      "#weather-description",
      "WEATHER UNAVAILABLE"
    );

    setText(
      "#station-condition",
      "CONNECTION ERROR"
    );

    setText(
      "#weather-updated",
      "OFFLINE"
    );
  }
}

getWeather();

setInterval(
  getWeather,
  weatherRefreshMinutes *
  60 *
  1000
);


// ==================================================
// ==================================================
// SCROLL STATE / PAINT STABILITY
// ==================================================

let pageIsScrolling =
  false;

let scrollStopTimer =
  null;

window.addEventListener(
  "scroll",
  function () {
    pageIsScrolling =
      true;

    document.body.classList.add(
      "is-scrolling"
    );

    clearTimeout(
      scrollStopTimer
    );

    scrollStopTimer =
      setTimeout(
        function () {
          pageIsScrolling =
            false;

          document.body.classList.remove(
            "is-scrolling"
          );
        },
        140
      );
  },
  {
    passive: true
  }
);


// ==================================================
// RADAR / ATMOSPHERE CANVAS
// ==================================================

(function startRadar() {
  const canvas =
    getElement("#sky");

  if (!canvas) {
    return;
  }

  const context =
    canvas.getContext("2d");

  if (!context) {
    return;
  }

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  let frame = 0;
  let lastDraw = 0;
  let radarVisible = true;

  const visibilityObserver =
    new IntersectionObserver(
      function (entries) {
        radarVisible =
          entries[0] &&
          entries[0].isIntersecting;
      },
      {
        threshold: 0.05
      }
    );

  visibilityObserver.observe(canvas);

  function resizeCanvas() {
    const rect =
      canvas.getBoundingClientRect();

    const density =
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      );

    canvas.width =
      Math.max(
        1,
        Math.floor(
          rect.width *
          density
        )
      );

    canvas.height =
      Math.max(
        1,
        Math.floor(
          rect.height *
          density
        )
      );

    context.setTransform(
      density,
      0,
      0,
      density,
      0,
      0
    );
  }

  function readColor(variableName) {
    return getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(
        variableName
      )
      .trim();
  }

  function drawRadar() {
    const width =
      canvas.clientWidth;

    const height =
      canvas.clientHeight;

    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    const ink =
      readColor("--ink");

    const green =
      readColor("--green");

    const orange =
      readColor("--orange");

    const sky =
      readColor("--sky");

    context.clearRect(
      0,
      0,
      width,
      height
    );

    context.fillStyle =
      sky;

    context.fillRect(
      0,
      0,
      width,
      height
    );

    context.globalAlpha =
      0.12;

    context.strokeStyle =
      ink;

    context.lineWidth =
      1;

    for (
      let y = 36;
      y < height;
      y += 42
    ) {
      context.beginPath();

      for (
        let x = 0;
        x <= width;
        x += 10
      ) {
        const waveY =
          y +
          Math.sin(
            x * 0.018 +
            frame * 0.006 +
            y
          ) *
          8;

        if (x === 0) {
          context.moveTo(
            x,
            waveY
          );
        }
        else {
          context.lineTo(
            x,
            waveY
          );
        }
      }

      context.stroke();
    }

    const centerX =
      width / 2;

    const centerY =
      height / 2;

    const radius =
      Math.min(
        width,
        height
      ) *
      0.39;

    context.globalAlpha =
      0.24;

    context.strokeStyle =
      green;

    for (
      let ring = 1;
      ring <= 4;
      ring += 1
    ) {
      context.beginPath();

      context.arc(
        centerX,
        centerY,
        radius *
        ring /
        4,
        0,
        Math.PI *
        2
      );

      context.stroke();
    }

    const angle =
      frame *
      0.0023;

    context.globalAlpha =
      0.18;

    context.fillStyle =
      orange;

    context.beginPath();

    context.moveTo(
      centerX,
      centerY
    );

    context.arc(
      centerX,
      centerY,
      radius,
      angle,
      angle + 0.46
    );

    context.closePath();
    context.fill();

    context.globalAlpha =
      1;

    frame += 1;
  }

  function animate(timestamp) {
    const canPaint =
      radarVisible &&
      !pageIsScrolling &&
      !document.hidden;

    // 12 fps is plenty for the atmospheric effect and avoids
    // forcing unrelated text to repaint at 30-60 fps.
    if (
      canPaint &&
      timestamp - lastDraw >= 83
    ) {
      lastDraw =
        timestamp;

      drawRadar();
    }

    if (!reducedMotion) {
      requestAnimationFrame(
        animate
      );
    }
  }

  resizeCanvas();
  drawRadar();

  if (!reducedMotion) {
    requestAnimationFrame(
      animate
    );
  }

  window.addEventListener(
    "resize",
    function () {
      resizeCanvas();
      drawRadar();
    },
    {
      passive: true
    }
  );

  window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).addEventListener(
    "change",
    drawRadar
  );
})();


// TRADINGVIEW THEME SYNC
// ==================================================

function updateMarketTheme() {
  const widget =
    getElement(
      "#market-widget"
    );

  if (!widget) {
    return;
  }

  const darkMode =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  widget.setAttribute(
    "theme",
    darkMode
      ? "dark"
      : "light"
  );
}

updateMarketTheme();

window.matchMedia(
  "(prefers-color-scheme: dark)"
).addEventListener(
  "change",
  updateMarketTheme
);


// ==================================================
// TICKER PAUSE WHEN TAB IS HIDDEN
// ==================================================

document.addEventListener(
  "visibilitychange",
  function () {
    const track =
      getElement(
        ".ticker-track"
      );

    if (!track) {
      return;
    }

    track.style.animationPlayState =
      document.hidden
        ? "paused"
        : "running";
  }
);
