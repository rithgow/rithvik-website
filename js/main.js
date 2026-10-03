(() => {
  "use strict";

  const get = (selector) =>
    document.querySelector(selector);

  function setText(selector, value) {
    const element =
      get(selector);

    if (element) {
      element.textContent =
        value;
    }
  }


  // ==================================================
  // CLOCK
  // ==================================================

  function updateClock() {
    const formatted =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "America/Chicago",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "short"
        }
      ).format(
        new Date()
      );

    setText(
      "#central-time",
      formatted
    );
  }

  updateClock();

  setInterval(
    updateClock,
    30000
  );


  // ==================================================
  // WEATHER
  // ==================================================

  const fallbackLocation = {
    latitude: 33.45,
    longitude: -88.82,
    label: "STARKVILLE",
    source: "fallback"
  };

  let activeLocation = {
    ...fallbackLocation
  };

  const weatherRefreshMinutes =
    10;

  function getWeatherDescription(code) {
    if (code === 0) return "CLEAR";
    if (code === 1) return "MAINLY CLEAR";
    if (code === 2) return "PARTLY CLOUDY";
    if (code === 3) return "OVERCAST";

    if (
      code === 45 ||
      code === 48
    ) {
      return "FOG";
    }

    if (
      code >= 51 &&
      code <= 57
    ) {
      return "DRIZZLE";
    }

    if (
      code >= 61 &&
      code <= 67
    ) {
      return "RAIN";
    }

    if (
      code >= 71 &&
      code <= 77
    ) {
      return "SNOW";
    }

    if (
      code >= 80 &&
      code <= 82
    ) {
      return "RAIN SHOWERS";
    }

    if (
      code === 85 ||
      code === 86
    ) {
      return "SNOW SHOWERS";
    }

    if (code === 95) {
      return "THUNDERSTORM";
    }

    if (
      code === 96 ||
      code === 99
    ) {
      return "SEVERE THUNDERSTORM";
    }

    return "VARIABLE";
  }

  function getWeatherCategory(code) {
    if (
      code === 0 ||
      code === 1
    ) {
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
      (
        code >= 51 &&
        code <= 67
      ) ||
      (
        code >= 80 &&
        code <= 82
      )
    ) {
      return "rain";
    }

    if (
      (
        code >= 71 &&
        code <= 77
      ) ||
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

    return directions[
      Math.round(
        degrees / 45
      ) % 8
    ];
  }

  function formatWeatherTime(
    dateString
  ) {
    const date =
      new Date(
        dateString
      );

    return date.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
  }

  function coordinateLabel(
    latitude,
    longitude
  ) {
    const latDirection =
      latitude >= 0
        ? "N"
        : "S";

    const lonDirection =
      longitude >= 0
        ? "E"
        : "W";

    return (
      Math.abs(latitude)
        .toFixed(2) +
      "°" +
      latDirection +
      " / " +
      Math.abs(longitude)
        .toFixed(2) +
      "°" +
      lonDirection
    );
  }

  function updateLocationLabels() {
    setText(
      "#weather-location",
      "WX / " +
      activeLocation.label
    );

    setText(
      "#weather-coordinates",
      coordinateLabel(
        activeLocation.latitude,
        activeLocation.longitude
      )
    );
  }

  async function getWeather() {
    updateLocationLabels();

    try {
      const params =
        new URLSearchParams({
          latitude:
            activeLocation.latitude,
          longitude:
            activeLocation.longitude,
          current:
            "temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure",
          daily:
            "sunrise,sunset",
          temperature_unit:
            "fahrenheit",
          wind_speed_unit:
            "mph",
          timezone:
            "auto"
        });

      const response =
        await fetch(
          "https://api.open-meteo.com/v1/forecast?" +
          params.toString(),
          {
            cache: "no-store"
          }
        );

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
        Math.round(
          weather.temperature_2m
        );

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
        weather.relative_humidity_2m +
        "%"
      );

      setText(
        "#dew-point",
        Math.round(
          weather.dew_point_2m
        ) + "°"
      );

      setText(
        "#cloud-cover",
        weather.cloud_cover +
        "%"
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

      setText(
        "#visibility",
        (
          weather.visibility /
          1609.344
        ).toFixed(1) +
        " mi"
      );

      setText(
        "#wind-direction",
        getWindDirection(
          weather.wind_direction_10m
        )
      );

      if (
        data.daily?.sunrise?.[0]
      ) {
        setText(
          "#sunrise",
          formatWeatherTime(
            data.daily.sunrise[0]
          )
        );
      }

      if (
        data.daily?.sunset?.[0]
      ) {
        setText(
          "#sunset",
          formatWeatherTime(
            data.daily.sunset[0]
          )
        );
      }

      let updatedTime =
        new Date()
          .toLocaleTimeString(
            [],
            {
              hour: "numeric",
              minute: "2-digit"
            }
          );

      if (data.timezone) {
        try {
          updatedTime =
            new Intl.DateTimeFormat(
              "en-US",
              {
                timeZone:
                  data.timezone,
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              }
            ).format(
              new Date()
            );
        }
        catch (error) {
          // Browser-local time is a fine fallback.
        }
      }

      setText(
        "#weather-updated",
        "UPDATED " +
        updatedTime
      );

      document.body.dataset.weather =
        getWeatherCategory(
          weather.weather_code
        );

      drawRadar();
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

  function requestVisitorLocation() {
    if (
      !navigator.geolocation
    ) {
      return Promise.reject(
        new Error(
          "Geolocation unavailable"
        )
      );
    }

    return new Promise(
      (resolve, reject) => {
        navigator.geolocation
          .getCurrentPosition(
            (position) => {
              resolve({
                latitude:
                  position.coords.latitude,
                longitude:
                  position.coords.longitude,
                label:
                  "YOUR LOCATION",
                source:
                  "visitor"
              });
            },
            reject,
            {
              enableHighAccuracy:
                false,
              timeout:
                8000,
              maximumAge:
                600000
            }
          );
      }
    );
  }

  async function useVisitorLocation(
    announce = true
  ) {
    const button =
      get(
        "#refresh-location"
      );

    if (button) {
      button.disabled =
        true;

      button.textContent =
        "LOCATING…";
    }

    try {
      activeLocation =
        await requestVisitorLocation();

      await getWeather();

      if (button) {
        button.textContent =
          "LOCATION ACTIVE";
      }
    }
    catch (error) {
      activeLocation = {
        ...fallbackLocation
      };

      await getWeather();

      if (button) {
        button.textContent =
          "LOCATION UNAVAILABLE";
      }

      if (announce) {
        document.dispatchEvent(
          new CustomEvent(
            "site:toast",
            {
              detail:
                "USING STARKVILLE WEATHER"
            }
          )
        );
      }
    }
    finally {
      window.setTimeout(
        () => {
          if (button) {
            button.disabled =
              false;

            button.textContent =
              activeLocation.source ===
              "visitor"
                ? "REFRESH LOCATION"
                : "USE MY LOCATION";
          }
        },
        1600
      );
    }
  }

  const locationButton =
    get(
      "#refresh-location"
    );

  if (locationButton) {
    locationButton.addEventListener(
      "click",
      () => {
        useVisitorLocation(
          true
        );
      }
    );
  }

  document.addEventListener(
    "site:entered",
    () => {
      if (
        activeLocation.source !==
        "visitor"
      ) {
        useVisitorLocation(
          false
        );
      }
    }
  );

  getWeather();

  setInterval(
    getWeather,
    weatherRefreshMinutes *
    60 *
    1000
  );

  try {
    if (
      sessionStorage.getItem(
        "rg-entered"
      ) === "1"
    ) {
      useVisitorLocation(
        false
      );
    }
  }
  catch (error) {
    // No-op.
  }


  // ==================================================
  // STATIC RADAR
  // ==================================================

  const radarCanvas =
    get("#sky");

  let radarContext =
    radarCanvas
      ? radarCanvas.getContext(
          "2d"
        )
      : null;

  function readColor(
    variableName,
    element =
      document.documentElement
  ) {
    return getComputedStyle(
      element
    )
      .getPropertyValue(
        variableName
      )
      .trim();
  }

  function resizeRadar() {
    if (
      !radarCanvas ||
      !radarContext
    ) {
      return;
    }

    const rect =
      radarCanvas
        .getBoundingClientRect();

    const density =
      Math.min(
        window.devicePixelRatio ||
        1,
        1.5
      );

    radarCanvas.width =
      Math.max(
        1,
        Math.floor(
          rect.width *
          density
        )
      );

    radarCanvas.height =
      Math.max(
        1,
        Math.floor(
          rect.height *
          density
        )
      );

    radarContext.setTransform(
      density,
      0,
      0,
      density,
      0,
      0
    );
  }

  function drawRadar() {
    if (
      !radarCanvas ||
      !radarContext
    ) {
      return;
    }

    const width =
      radarCanvas.clientWidth;

    const height =
      radarCanvas.clientHeight;

    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    const panel =
      get(".sky-panel") ||
      document.documentElement;

    const ink =
      readColor(
        "--ink",
        panel
      );

    const green =
      readColor(
        "--green",
        panel
      );

    const orange =
      readColor(
        "--orange",
        panel
      );

    const sky =
      readColor(
        "--sky",
        panel
      );

    radarContext.clearRect(
      0,
      0,
      width,
      height
    );

    radarContext.fillStyle =
      sky;

    radarContext.fillRect(
      0,
      0,
      width,
      height
    );

    radarContext.globalAlpha =
      0.12;

    radarContext.strokeStyle =
      ink;

    radarContext.lineWidth =
      1;

    for (
      let y = 36;
      y < height;
      y += 42
    ) {
      radarContext.beginPath();

      for (
        let x = 0;
        x <= width;
        x += 10
      ) {
        const waveY =
          y +
          Math.sin(
            x * 0.018 +
            y
          ) *
          8;

        if (x === 0) {
          radarContext.moveTo(
            x,
            waveY
          );
        }
        else {
          radarContext.lineTo(
            x,
            waveY
          );
        }
      }

      radarContext.stroke();
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

    radarContext.globalAlpha =
      0.24;

    radarContext.strokeStyle =
      green;

    for (
      let ring = 1;
      ring <= 4;
      ring += 1
    ) {
      radarContext.beginPath();

      radarContext.arc(
        centerX,
        centerY,
        radius *
        ring /
        4,
        0,
        Math.PI * 2
      );

      radarContext.stroke();
    }

    radarContext.globalAlpha =
      0.18;

    radarContext.fillStyle =
      orange;

    radarContext.beginPath();

    radarContext.moveTo(
      centerX,
      centerY
    );

    radarContext.arc(
      centerX,
      centerY,
      radius,
      -0.75,
      -0.29
    );

    radarContext.closePath();
    radarContext.fill();

    radarContext.globalAlpha =
      1;
  }

  if (
    radarCanvas &&
    radarContext
  ) {
    resizeRadar();
    drawRadar();

    let resizeTimer =
      null;

    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            () => {
              resizeRadar();
              drawRadar();
            },
            140
          );
      },
      {
        passive: true
      }
    );

    new MutationObserver(
      (mutations) => {
        if (
          mutations.some(
            mutation =>
              mutation.attributeName ===
              "data-theme"
          )
        ) {
          drawRadar();
        }
      }
    ).observe(
      document.documentElement,
      {
        attributes: true
      }
    );
  }


  // ==================================================
  // NOW DATA
  // ==================================================

  async function loadSiteData() {
    try {
      const response =
        await fetch(
          "data/site.json",
          {
            cache: "no-store"
          }
        );

      if (!response.ok) {
        throw new Error(
          "Site data unavailable"
        );
      }

      const data =
        await response.json();

      const now =
        data.now ||
        {};

      if (data.updated) {
        setText(
          "#now-updated",
          "UPDATED " +
          data.updated
        );
      }

      if (now.workingTitle) {
        setText(
          "#now-working-title",
          now.workingTitle
        );
      }

      const list =
        get(
          "#now-working-list"
        );

      if (
        list &&
        Array.isArray(
          now.working
        )
      ) {
        list.innerHTML =
          "";

        now.working
          .slice(0, 5)
          .forEach(
            item => {
              const li =
                document.createElement(
                  "li"
                );

              li.textContent =
                item;

              list.appendChild(
                li
              );
            }
          );
      }

      if (
        now.listening?.label
      ) {
        setText(
          "#now-listening",
          now.listening.label
        );
      }

      if (
        now.listening?.detail
      ) {
        setText(
          "#now-listening-detail",
          now.listening.detail
        );
      }

      const spotify =
        get(
          "#spotify-profile"
        );

      const spotifyUrl =
        now.listening
          ?.spotifyUrl ||
        data.socials
          ?.spotifyUrl ||
        "";

      if (
        spotify &&
        spotifyUrl
      ) {
        spotify.href =
          spotifyUrl;

        spotify.target =
          "_blank";

        spotify.rel =
          "noreferrer";

        spotify.textContent =
          "OPEN MY SPOTIFY ↗";

        spotify.classList.remove(
          "is-disabled"
        );

        spotify.removeAttribute(
          "aria-disabled"
        );
      }

      if (now.reading?.title) {
        setText(
          "#now-reading",
          now.reading.title
        );
      }

      if (now.reading?.detail) {
        setText(
          "#now-reading-detail",
          now.reading.detail
        );
      }

      if (now.watching?.title) {
        setText(
          "#now-watching",
          now.watching.title
        );
      }

      if (now.watching?.detail) {
        setText(
          "#now-watching-detail",
          now.watching.detail
        );
      }
    }
    catch (error) {
      console.warn(
        "Using built-in Now content:",
        error
      );
    }
  }

  loadSiteData();


  // ==================================================
  // TRADINGVIEW THEME
  // ==================================================

  function updateMarketTheme() {
    const widget =
      get(
        "#market-widget"
      );

    if (!widget) {
      return;
    }

    const darkThemes = [
      "night",
      "storm",
      "aurora"
    ];

    widget.setAttribute(
      "theme",
      darkThemes.includes(
        document.documentElement
          .dataset.theme
      )
        ? "dark"
        : "light"
    );
  }

  updateMarketTheme();

  new MutationObserver(
    updateMarketTheme
  ).observe(
    document.documentElement,
    {
      attributes: true,
      attributeFilter: [
        "data-theme"
      ]
    }
  );
})();