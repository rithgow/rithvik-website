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

  let radarWeatherCategory =
    "cloudy";

  let radarWeatherCode =
    3;

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

      radarWeatherCode =
        weather.weather_code;

      radarWeatherCategory =
        getWeatherCategory(
          weather.weather_code
        );

      document.body.dataset.weather =
        radarWeatherCategory;

      rebuildRadarWeather();
      drawRadar(
        performance.now()
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

  getWeather();

  setInterval(
    getWeather,
    weatherRefreshMinutes *
    60 *
    1000
  );

  // ==================================================
  // WEATHER-AWARE RADAR
  //
  // Only the canvas animates. Text and layout remain static.
  // The loop is capped at 10 FPS and pauses off-screen.
  // ==================================================

  const radarCanvas =
    get("#sky");

  let radarContext =
    radarCanvas
      ? radarCanvas.getContext(
          "2d"
        )
      : null;

  let radarCells =
    [];

  let radarVisible =
    true;

  const radarReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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

  function pseudoRandom(
    index,
    salt
  ) {
    const value =
      Math.sin(
        index * 12.9898 +
        salt * 78.233
      ) *
      43758.5453;

    return value -
      Math.floor(value);
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

    rebuildRadarWeather();
  }

  function rebuildRadarWeather() {
    if (!radarCanvas) {
      return;
    }

    const category =
      radarWeatherCategory;

    let count =
      0;

    if (category === "rain") {
      count = 26;
    }
    else if (category === "storm") {
      count = 34;
    }
    else if (category === "snow") {
      count = 42;
    }
    else if (category === "cloudy") {
      count = 9;
    }

    radarCells =
      Array.from(
        {
          length: count
        },
        (_, index) => ({
          angle:
            pseudoRandom(
              index,
              1
            ) *
            Math.PI *
            2,

          distance:
            0.12 +
            pseudoRandom(
              index,
              2
            ) *
            0.82,

          size:
            7 +
            pseudoRandom(
              index,
              3
            ) *
            (
              category ===
              "storm"
                ? 34
                : category ===
                  "snow"
                  ? 10
                  : 23
            ),

          phase:
            pseudoRandom(
              index,
              4
            ) *
            Math.PI *
            2,

          strength:
            0.22 +
            pseudoRandom(
              index,
              5
            ) *
            0.66,

          core:
            pseudoRandom(
              index,
              6
            )
        })
      );
  }

  function drawRadarBase(
    width,
    height,
    timestamp = 0
  ) {
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
      0.1;

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
        x += 12
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
      0.22;

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

    const sweepAngle =
      radarReducedMotion
        ? -0.76
        : (
            timestamp *
            0.00075
          ) %
          (
            Math.PI *
            2
          );

    // Main orange radar sweep.
    radarContext.globalAlpha =
      0.14;

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
      sweepAngle,
      sweepAngle + 0.48
    );

    radarContext.closePath();
    radarContext.fill();

    // Thin leading edge makes the sweep feel more like a real radar scope.
    radarContext.globalAlpha =
      0.42;

    radarContext.strokeStyle =
      orange;

    radarContext.lineWidth =
      1.25;

    radarContext.beginPath();

    radarContext.moveTo(
      centerX,
      centerY
    );

    radarContext.lineTo(
      centerX +
      Math.cos(
        sweepAngle + 0.48
      ) *
      radius,
      centerY +
      Math.sin(
        sweepAngle + 0.48
      ) *
      radius
    );

    radarContext.stroke();

    radarContext.globalAlpha =
      1;

    return {
      centerX,
      centerY,
      radius
    };
  }

  function drawRadarWeather(
    geometry,
    timestamp
  ) {
    const category =
      radarWeatherCategory;

    if (
      category === "clear" ||
      radarCells.length === 0
    ) {
      return;
    }

    const {
      centerX,
      centerY,
      radius
    } = geometry;

    const time =
      radarReducedMotion
        ? 0
        : timestamp *
          0.00016;

    radarContext.save();

    radarContext.beginPath();

    radarContext.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2
    );

    radarContext.clip();

    radarCells.forEach(
      (cell, index) => {
        const driftX =
          Math.sin(
            time +
            cell.phase
          ) *
          (
            category ===
            "snow"
              ? 6
              : 16
          );

        const driftY =
          Math.cos(
            time * 0.72 +
            cell.phase
          ) *
          (
            category ===
            "snow"
              ? 10
              : 9
          );

        const cellRadius =
          radius *
          cell.distance;

        const x =
          centerX +
          Math.cos(
            cell.angle
          ) *
          cellRadius +
          driftX;

        const y =
          centerY +
          Math.sin(
            cell.angle
          ) *
          cellRadius +
          driftY;

        if (
          category ===
          "snow"
        ) {
          radarContext.globalAlpha =
            0.28 +
            cell.strength *
            0.3;

          radarContext.fillStyle =
            index % 3 === 0
              ? "#e9fbff"
              : "#9bd9e8";

          radarContext.beginPath();

          radarContext.arc(
            x,
            y,
            Math.max(
              1.4,
              cell.size * 0.23
            ),
            0,
            Math.PI * 2
          );

          radarContext.fill();

          return;
        }

        if (
          category ===
          "cloudy"
        ) {
          radarContext.globalAlpha =
            0.08 +
            cell.strength *
            0.08;

          radarContext.fillStyle =
            "#9bc0ba";

          radarContext.beginPath();

          radarContext.arc(
            x,
            y,
            cell.size * 1.5,
            0,
            Math.PI * 2
          );

          radarContext.fill();

          return;
        }

        // Doppler-like precipitation cells:
        // green outer echoes, yellow/orange cores, red for stronger storms.
        radarContext.globalAlpha =
          0.18 +
          cell.strength *
          0.26;

        radarContext.fillStyle =
          "#29a65a";

        radarContext.beginPath();

        radarContext.arc(
          x,
          y,
          cell.size * 1.35,
          0,
          Math.PI * 2
        );

        radarContext.fill();

        radarContext.globalAlpha =
          0.2 +
          cell.strength *
          0.3;

        radarContext.fillStyle =
          category === "storm"
            ? (
                cell.core > 0.72
                  ? "#d5452e"
                  : "#efaa2d"
              )
            : "#d9c83b";

        radarContext.beginPath();

        radarContext.arc(
          x +
          cell.size * 0.18,
          y -
          cell.size * 0.1,
          cell.size *
          (
            category === "storm"
              ? 0.72
              : 0.48
          ),
          0,
          Math.PI * 2
        );

        radarContext.fill();

        if (
          category === "storm" &&
          cell.core > 0.84
        ) {
          radarContext.globalAlpha =
            0.48;

          radarContext.fillStyle =
            "#b8272d";

          radarContext.beginPath();

          radarContext.arc(
            x +
            cell.size * 0.24,
            y -
            cell.size * 0.12,
            cell.size * 0.3,
            0,
            Math.PI * 2
          );

          radarContext.fill();
        }
      }
    );

    radarContext.restore();
    radarContext.globalAlpha =
      1;

    if (
      category === "storm"
    ) {
      radarContext.save();

      radarContext.globalAlpha =
        0.08;

      radarContext.strokeStyle =
        "#f2f6df";

      radarContext.lineWidth =
        1;

      const boltX =
        centerX +
        radius * 0.22;

      const boltY =
        centerY -
        radius * 0.18;

      radarContext.beginPath();

      radarContext.moveTo(
        boltX,
        boltY
      );

      radarContext.lineTo(
        boltX - 8,
        boltY + 20
      );

      radarContext.lineTo(
        boltX + 3,
        boltY + 18
      );

      radarContext.lineTo(
        boltX - 5,
        boltY + 38
      );

      radarContext.stroke();
      radarContext.restore();
    }
  }

  function drawRadar(
    timestamp = 0
  ) {
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

    const geometry =
      drawRadarBase(
        width,
        height,
        timestamp
      );

    drawRadarWeather(
      geometry,
      timestamp
    );
  }

  function animateRadarWeather() {
    if (
      radarVisible &&
      !document.hidden &&
      !radarReducedMotion
    ) {
      drawRadar(
        performance.now()
      );
    }
  }

  if (
    radarCanvas &&
    radarContext
  ) {
    resizeRadar();
    rebuildRadarWeather();
    drawRadar(0);

    const observer =
      new IntersectionObserver(
        entries => {
          radarVisible =
            Boolean(
              entries[0]
                ?.isIntersecting
            );
        },
        {
          threshold: 0.04
        }
      );

    observer.observe(
      radarCanvas
    );

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
              drawRadar(
                performance.now()
              );
            },
            160
          );
      },
      {
        passive: true
      }
    );

    new MutationObserver(
      mutations => {
        if (
          mutations.some(
            mutation =>
              mutation.attributeName ===
              "data-theme"
          )
        ) {
          drawRadar(
            performance.now()
          );
        }
      }
    ).observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "data-theme"
        ]
      }
    );

    if (!radarReducedMotion) {
      window.setInterval(
        animateRadarWeather,
        84
      );
    }
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

      const instagram =
        get(
          "#instagram-contact"
        );

      const instagramUrl =
        data.socials
          ?.instagram ||
        "";

      if (
        instagram &&
        instagramUrl
      ) {
        instagram.href =
          instagramUrl;

        instagram.target =
          "_blank";

        instagram.rel =
          "noreferrer";

        instagram.classList.remove(
          "contact-social-pending"
        );

        instagram.removeAttribute(
          "aria-disabled"
        );

        try {
          const path =
            new URL(
              instagramUrl
            ).pathname
              .replaceAll(
                "/",
                ""
              );

          setText(
            "#instagram-contact-label",
            path
              ? "@" + path
              : "INSTAGRAM"
          );
        }
        catch (error) {
          setText(
            "#instagram-contact-label",
            "INSTAGRAM"
          );
        }
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