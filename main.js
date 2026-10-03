// ==================================================
// CONFIG
// ==================================================

const latitude = 33.45;
const longitude = -88.82;

const weatherRefreshMinutes = 10;



// ==================================================
// HELPER
// ==================================================

function getElement(selector) {

  return document.querySelector(selector);

}



// ==================================================
// LIVE CLOCK
// ==================================================

function updateClock() {

  const now =
    new Date();


  const time =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  const clock =
    getElement(
      "#clock"
    );


  if (clock) {

    clock.textContent =
      time;

  }


  const footerYear =
    getElement(
      "#footer-year"
    );


  if (footerYear) {

    footerYear.textContent =
      now.getFullYear();

  }

}


updateClock();


setInterval(
  updateClock,
  1000
);



// ==================================================
// LIVE WEATHER
// ==================================================

async function getWeather() {

  try {


    const weatherURL =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,is_day` +
      `&daily=sunrise,sunset` +
      `&temperature_unit=fahrenheit` +
      `&wind_speed_unit=mph` +
      `&timezone=America%2FChicago`;


    const response =
      await fetch(
        weatherURL
      );


    if (!response.ok) {

      throw new Error(
        `Weather request failed: ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "Weather data:",
      data
    );


    const weather =
      data.current;



    // ----------------------------------------------
    // TEMPERATURE
    // ----------------------------------------------

    const temperature =
      Math.round(
        weather.temperature_2m
      );


    const temperatureElement =
      getElement(
        "#temperature"
      );


    if (temperatureElement) {

      temperatureElement.textContent =
        temperature;

    }


    const projectTemperature =
      getElement(
        "#project-temperature"
      );


    if (projectTemperature) {

      projectTemperature.textContent =
        temperature;

    }



    // ----------------------------------------------
    // FEELS LIKE
    // ----------------------------------------------

    const feelsLike =
      getElement(
        "#feels-like"
      );


    if (feelsLike) {

      feelsLike.textContent =
        Math.round(
          weather.apparent_temperature
        ) + "°";

    }



    // ----------------------------------------------
    // HUMIDITY
    // ----------------------------------------------

    const humidity =
      getElement(
        "#humidity"
      );


    if (humidity) {

      humidity.textContent =
        weather.relative_humidity_2m + "%";

    }



    // ----------------------------------------------
    // DEW POINT
    // ----------------------------------------------

    const dewPoint =
      getElement(
        "#dew-point"
      );


    if (dewPoint) {

      dewPoint.textContent =
        Math.round(
          weather.dew_point_2m
        ) + "°";

    }



    // ----------------------------------------------
    // CLOUD COVER
    // ----------------------------------------------

    const cloudCover =
      getElement(
        "#cloud-cover"
      );


    if (cloudCover) {

      cloudCover.textContent =
        weather.cloud_cover + "%";

    }



    // ----------------------------------------------
    // VISIBILITY
    // ----------------------------------------------

    const visibilityMiles =
      weather.visibility /
      1609.344;


    const visibility =
      getElement(
        "#visibility"
      );


    if (visibility) {

      visibility.textContent =
        visibilityMiles
          .toFixed(1) +
        " mi";

    }



    // ----------------------------------------------
    // WIND SPEED
    // ----------------------------------------------

    const wind =
      getElement(
        "#wind"
      );


    if (wind) {

      wind.textContent =
        Math.round(
          weather.wind_speed_10m
        ) + " mph";

    }



    // ----------------------------------------------
    // GUST
    // ----------------------------------------------

    const gust =
      getElement(
        "#gust"
      );


    if (gust) {

      gust.textContent =
        Math.round(
          weather.wind_gusts_10m
        ) + " mph";

    }



    // ----------------------------------------------
    // PRESSURE
    // ----------------------------------------------

    const pressure =
      getElement(
        "#pressure"
      );


    if (pressure) {

      pressure.textContent =
        Math.round(
          weather.surface_pressure
        ) + " hPa";

    }



    // ----------------------------------------------
    // WIND DIRECTION
    // ----------------------------------------------

    const windDegrees =
      weather.wind_direction_10m;


    const windArrow =
      getElement(
        "#wind-arrow"
      );


    if (windArrow) {

      windArrow.style.transform =
        `rotate(${windDegrees}deg)`;

    }


    const windDirection =
      getElement(
        "#wind-direction"
      );


    if (windDirection) {

      windDirection.textContent =
        getWindDirection(
          windDegrees
        );

    }



    // ----------------------------------------------
    // DAY / NIGHT
    // ----------------------------------------------

    const isDay =
      weather.is_day === 1;


    const dayStatus =
      getElement(
        "#day-status"
      );


    if (dayStatus) {

      dayStatus.textContent =
        isDay
          ? "DAY"
          : "NIGHT";

    }



    // ----------------------------------------------
    // WEATHER DESCRIPTION
    // ----------------------------------------------

    const weatherDescription =
      getElement(
        "#weather-description"
      );


    if (weatherDescription) {

      weatherDescription.textContent =
        getWeatherDescription(
          weather.weather_code
        );

    }



    // ----------------------------------------------
    // SUNRISE / SUNSET
    // ----------------------------------------------

    if (
      data.daily &&
      data.daily.sunrise &&
      data.daily.sunset
    ) {


      const sunrise =
        getElement(
          "#sunrise"
        );


      if (sunrise) {

        sunrise.textContent =
          formatWeatherTime(
            data.daily.sunrise[0]
          );

      }


      const sunset =
        getElement(
          "#sunset"
        );


      if (sunset) {

        sunset.textContent =
          formatWeatherTime(
            data.daily.sunset[0]
          );

      }

    }



    // ----------------------------------------------
    // UPDATE TIME
    // ----------------------------------------------

    const updateTime =
      new Date()
        .toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        );


    const weatherUpdated =
      getElement(
        "#weather-updated"
      );


    if (weatherUpdated) {

      weatherUpdated.textContent =
        `UPDATED ${updateTime}`;

    }



    // ----------------------------------------------
    // WEATHER THEME
    // ----------------------------------------------

    setWeatherTheme(
      weather.weather_code,
      isDay
    );


  }

  catch (error) {


    console.error(
      "Weather failed to load:",
      error
    );


    const description =
      getElement(
        "#weather-description"
      );


    if (description) {

      description.textContent =
        "WEATHER UNAVAILABLE";

    }


    const updated =
      getElement(
        "#weather-updated"
      );


    if (updated) {

      updated.textContent =
        "CONNECTION ERROR";

    }


  }

}



// ==================================================
// WEATHER DESCRIPTION
// ==================================================

function getWeatherDescription(code) {


  if (code === 0) {
    return "CLEAR";
  }


  if (code === 1) {
    return "MAINLY CLEAR";
  }


  if (code === 2) {
    return "PARTLY CLOUDY";
  }


  if (code === 3) {
    return "OVERCAST";
  }


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


  return "UNKNOWN";

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
    Math.round(
      degrees / 45
    ) % 8;


  return directions[index];

}



// ==================================================
// FORMAT WEATHER TIME
// ==================================================

function formatWeatherTime(dateString) {


  const date =
    new Date(
      dateString
    );


  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}



// ==================================================
// WEATHER THEME
// ==================================================

function setWeatherTheme(
  code,
  isDay
) {


  const body =
    document.body;


  body.classList.remove(
    "weather-clear",
    "weather-cloudy",
    "weather-rain",
    "weather-snow",
    "weather-storm",
    "day-mode",
    "night-mode"
  );


  if (isDay) {

    body.classList.add(
      "day-mode"
    );

  }

  else {

    body.classList.add(
      "night-mode"
    );

  }



  if (
    code === 0 ||
    code === 1
  ) {

    body.classList.add(
      "weather-clear"
    );

  }


  else if (
    code === 2 ||
    code === 3 ||
    code === 45 ||
    code === 48
  ) {

    body.classList.add(
      "weather-cloudy"
    );

  }


  else if (
    (
      code >= 51 &&
      code <= 67
    )
    ||
    (
      code >= 80 &&
      code <= 82
    )
  ) {

    body.classList.add(
      "weather-rain"
    );

  }


  else if (
    (
      code >= 71 &&
      code <= 77
    )
    ||
    code === 85 ||
    code === 86
  ) {

    body.classList.add(
      "weather-snow"
    );

  }


  else if (
    code >= 95
  ) {

    body.classList.add(
      "weather-storm"
    );

  }


}



// ==================================================
// START WEATHER
// ==================================================

getWeather();


setInterval(
  getWeather,
  weatherRefreshMinutes *
  60 *
  1000
);



// ==================================================
// STABLE PAGE NAVIGATION
// ==================================================

let activeScrollAnimation =
  null;


function cancelActiveScroll() {


  if (
    activeScrollAnimation !== null
  ) {


    cancelAnimationFrame(
      activeScrollAnimation
    );


    activeScrollAnimation =
      null;


  }


  document.body.classList.remove(
    "is-scrolling"
  );


}



function scrollToSection(target) {


  const element =
    typeof target === "string"
      ? document.querySelector(
          target
        )
      : target;


  if (!element) {

    return;

  }



  cancelActiveScroll();



  const topbar =
    document.querySelector(
      ".topbar"
    );


  const headerHeight =
    topbar
      ? topbar.offsetHeight
      : 0;



  const startY =
    window.scrollY;



  const elementTop =
    element
      .getBoundingClientRect()
      .top +
    window.scrollY;



  const destinationY =
    Math.max(
      0,
      elementTop -
      headerHeight -
      12
    );



  const distance =
    destinationY -
    startY;



  if (
    Math.abs(distance) <
    2
  ) {


    window.scrollTo(
      0,
      Math.round(
        destinationY
      )
    );


    return;


  }



  const duration =
    Math.min(
      420,
      Math.max(
        220,
        Math.abs(distance) *
        0.12
      )
    );



  const startTime =
    performance.now();



  document.body.classList.add(
    "is-scrolling"
  );



  function animateScroll(currentTime) {


    const elapsed =
      currentTime -
      startTime;



    const progress =
      Math.min(
        elapsed /
        duration,
        1
      );



    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );



    const currentY =
      startY +
      distance *
      eased;



    window.scrollTo(
      0,
      Math.round(
        currentY
      )
    );



    if (
      progress <
      1
    ) {


      activeScrollAnimation =
        requestAnimationFrame(
          animateScroll
        );


    }

    else {


      activeScrollAnimation =
        null;


      window.scrollTo(
        0,
        Math.round(
          destinationY
        )
      );


      document.body.classList.remove(
        "is-scrolling"
      );


    }


  }



  activeScrollAnimation =
    requestAnimationFrame(
      animateScroll
    );


}



// ==================================================
// INTERNAL PAGE LINKS
// ==================================================

const internalLinks =
  document.querySelectorAll(
    'a[href^="#"]'
  );


internalLinks.forEach(
  (link) => {


    link.addEventListener(
      "click",
      (event) => {


        const target =
          link.getAttribute(
            "href"
          );


        if (
          !target ||
          target === "#"
        ) {

          return;

        }



        const targetElement =
          document.querySelector(
            target
          );


        if (!targetElement) {

          return;

        }



        event.preventDefault();



        scrollToSection(
          targetElement
        );



        history.replaceState(
          null,
          "",
          target
        );


      }
    );


  }
);



// ==================================================
// STOP PROGRAMMATIC SCROLL IF USER TAKES CONTROL
// ==================================================

window.addEventListener(
  "wheel",
  cancelActiveScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "touchstart",
  cancelActiveScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "mousedown",
  (event) => {


    if (
      event.button === 1
    ) {

      cancelActiveScroll();

    }


  }
);



// ==================================================
// SCROLL PERFORMANCE MODE
// Also helps minor text shimmer while manually scrolling.
// ==================================================

let scrollIdleTimer =
  null;


window.addEventListener(
  "scroll",
  () => {


    document.body.classList.add(
      "is-scrolling"
    );


    clearTimeout(
      scrollIdleTimer
    );


    scrollIdleTimer =
      setTimeout(
        () => {


          if (
            activeScrollAnimation ===
            null
          ) {


            document.body.classList.remove(
              "is-scrolling"
            );


          }


        },
        120
      );


  },
  {
    passive: true
  }
);



// ==================================================
// COMMAND CENTER
// ==================================================

const commandOverlay =
  getElement(
    "#command-overlay"
  );


const commandSearch =
  getElement(
    "#command-search"
  );


const commandItems =
  Array.from(
    document.querySelectorAll(
      ".command-item"
    )
  );


let selectedCommandIndex =
  0;



// ==================================================
// OPEN COMMAND CENTER
// ==================================================

function openCommandCenter() {


  if (
    !commandOverlay ||
    !commandSearch
  ) {

    return;

  }


  commandOverlay.classList.add(
    "open"
  );


  commandOverlay.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "command-open"
  );


  commandSearch.value =
    "";


  filterCommands();


  selectedCommandIndex =
    0;


  updateSelectedCommand();


  setTimeout(
    () => {


      commandSearch.focus();


    },
    30
  );


}



// ==================================================
// CLOSE COMMAND CENTER
// ==================================================

function closeCommandCenter() {


  if (!commandOverlay) {

    return;

  }


  commandOverlay.classList.remove(
    "open"
  );


  commandOverlay.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "command-open"
  );


}



// ==================================================
// VISIBLE COMMANDS
// ==================================================

function getVisibleCommands() {


  return commandItems.filter(
    (item) =>
      !item.hidden
  );


}



// ==================================================
// FILTER COMMANDS
// ==================================================

function filterCommands() {


  if (!commandSearch) {

    return;

  }


  const searchTerm =
    commandSearch.value
      .toLowerCase()
      .trim();


  commandItems.forEach(
    (item) => {


      const keywords =
        (
          item.dataset.search ||
          ""
        )
        .toLowerCase();


      item.hidden =
        !keywords.includes(
          searchTerm
        );


    }
  );


  selectedCommandIndex =
    0;


  updateSelectedCommand();


}



// ==================================================
// UPDATE SELECTED COMMAND
// ==================================================

function updateSelectedCommand() {


  const visibleCommands =
    getVisibleCommands();


  commandItems.forEach(
    (item) => {


      item.classList.remove(
        "selected"
      );


    }
  );


  if (
    visibleCommands.length ===
    0
  ) {

    return;

  }


  if (
    selectedCommandIndex >=
    visibleCommands.length
  ) {

    selectedCommandIndex =
      0;

  }


  visibleCommands[
    selectedCommandIndex
  ].classList.add(
    "selected"
  );


}



// ==================================================
// EXECUTE COMMAND
// ==================================================

function executeCommand(item) {


  if (!item) {

    return;

  }


  const target =
    item.dataset.target;


  const action =
    item.dataset.action;


  closeCommandCenter();



  if (target) {


    const section =
      getElement(
        target
      );


    if (section) {


      scrollToSection(
        section
      );


      history.replaceState(
        null,
        "",
        target
      );


    }


  }



  if (
    action === "weather"
  ) {


    const weatherPanel =
      getElement(
        ".weather"
      );


    if (!weatherPanel) {

      return;

    }


    scrollToSection(
      weatherPanel
    );


    weatherPanel.classList.add(
      "panel-highlight"
    );


    setTimeout(
      () => {


        weatherPanel.classList.remove(
          "panel-highlight"
        );


      },
      1200
    );


  }


}



// ==================================================
// COMMAND BUTTON EVENTS
// ==================================================

const commandButton =
  getElement(
    "#command-button"
  );


if (commandButton) {


  commandButton.addEventListener(
    "click",
    openCommandCenter
  );


}



const heroCommandButton =
  getElement(
    "#hero-command-button"
  );


if (heroCommandButton) {


  heroCommandButton.addEventListener(
    "click",
    openCommandCenter
  );


}



if (commandSearch) {


  commandSearch.addEventListener(
    "input",
    filterCommands
  );


}



commandItems.forEach(
  (item) => {


    item.addEventListener(
      "click",
      () => {


        executeCommand(
          item
        );


      }
    );


  }
);



if (commandOverlay) {


  commandOverlay.addEventListener(
    "click",
    (event) => {


      if (
        event.target ===
        commandOverlay
      ) {


        closeCommandCenter();


      }


    }
  );


}



// ==================================================
// KEYBOARD CONTROLS
// ==================================================

document.addEventListener(
  "keydown",
  (event) => {



    // CTRL + K

    if (
      event.ctrlKey &&
      event.key
        .toLowerCase() ===
        "k"
    ) {


      event.preventDefault();


      if (
        commandOverlay &&
        commandOverlay
          .classList
          .contains(
            "open"
          )
      ) {


        closeCommandCenter();


      }

      else {


        openCommandCenter();


      }


    }



    if (
      !commandOverlay ||
      !commandOverlay
        .classList
        .contains(
          "open"
        )
    ) {


      return;


    }



    // ESCAPE

    if (
      event.key ===
      "Escape"
    ) {


      closeCommandCenter();


      return;


    }



    const visibleCommands =
      getVisibleCommands();



    if (
      visibleCommands.length ===
      0
    ) {


      return;


    }



    // DOWN

    if (
      event.key ===
      "ArrowDown"
    ) {


      event.preventDefault();


      selectedCommandIndex =
        (
          selectedCommandIndex +
          1
        )
        %
        visibleCommands.length;


      updateSelectedCommand();


    }



    // UP

    if (
      event.key ===
      "ArrowUp"
    ) {


      event.preventDefault();


      selectedCommandIndex =
        (
          selectedCommandIndex -
          1 +
          visibleCommands.length
        )
        %
        visibleCommands.length;


      updateSelectedCommand();


    }



    // ENTER

    if (
      event.key ===
      "Enter"
    ) {


      event.preventDefault();


      executeCommand(
        visibleCommands[
          selectedCommandIndex
        ]
      );


    }


  }
);