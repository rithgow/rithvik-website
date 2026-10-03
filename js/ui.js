(() => {
  "use strict";

  const root = document.documentElement;

  const get = (selector) =>
    document.querySelector(selector);

  const getAll = (selector) =>
    Array.from(document.querySelectorAll(selector));

  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      }
      catch (error) {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, value);
      }
      catch (error) {
        // Preferences simply stay in memory if storage is blocked.
      }
    }
  };


  // ==================================================
  // THEME + FONT
  // ==================================================

  const themes = {
    sunny: "Sunny Afternoon",
    night: "Night Sky",
    storm: "Storm Front",
    golden: "Golden Hour",
    aurora: "Aurora Watch"
  };

  function applyTheme(theme, announce = false) {
    const nextTheme =
      themes[theme]
        ? theme
        : "sunny";

    root.dataset.theme =
      nextTheme;

    storage.set(
      "rg-theme",
      nextTheme
    );

    updateThemeButtons();

    if (announce) {
      toast(
        themes[nextTheme]
      );

      playSound("theme");
    }
  }

  function applyFont(font, announce = false) {
    const allowed = [
      "signal",
      "observatory",
      "journal"
    ];

    const nextFont =
      allowed.includes(font)
        ? font
        : "signal";

    root.dataset.font =
      nextFont;

    storage.set(
      "rg-font",
      nextFont
    );

    const select =
      get("#font-select");

    if (select) {
      select.value =
        nextFont;
    }

    if (announce) {
      toast(
        "TYPE SYSTEM UPDATED"
      );

      playSound("tick");
    }
  }

  function updateThemeButtons() {
    const current =
      root.dataset.theme ||
      "sunny";

    getAll("[data-theme-choice]")
      .forEach((button) => {
        const active =
          button.dataset.themeChoice ===
          current;

        button.classList.toggle(
          "is-active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          String(active)
        );
      });
  }


  // ==================================================
  // SUBTLE SOUND SYSTEM
  // ==================================================

  let audioContext = null;

  let soundEnabled =
    storage.get(
      "rg-sound-enabled",
      "true"
    ) !== "false";

  let volume =
    Number(
      storage.get(
        "rg-volume",
        "12"
      )
    ) / 100;

  function ensureAudio() {
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      audioContext =
        new AudioContextClass();
    }

    if (
      audioContext.state ===
      "suspended"
    ) {
      audioContext.resume();
    }

    return audioContext;
  }

  function tone(
    frequency,
    duration,
    gainValue,
    delay = 0
  ) {
    if (
      !soundEnabled ||
      volume <= 0
    ) {
      return;
    }

    const context =
      ensureAudio();

    if (!context) {
      return;
    }

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    const start =
      context.currentTime +
      delay;

    oscillator.type =
      "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      start
    );

    gain.gain.setValueAtTime(
      0.0001,
      start
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(
        0.0001,
        gainValue * volume
      ),
      start + 0.012
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(
      start + duration + 0.02
    );
  }

  function playSound(type = "tick") {
    if (!soundEnabled) {
      return;
    }

    switch (type) {
      case "open":
        tone(420, 0.09, 0.7);
        tone(620, 0.1, 0.45, 0.035);
        break;

      case "enter":
        tone(310, 0.12, 0.65);
        tone(465, 0.14, 0.52, 0.05);
        tone(620, 0.16, 0.38, 0.1);
        break;

      case "theme":
        tone(520, 0.1, 0.5);
        tone(700, 0.12, 0.36, 0.045);
        break;

      case "secret":
        tone(280, 0.12, 0.55);
        tone(560, 0.12, 0.5, 0.06);
        tone(840, 0.16, 0.34, 0.12);
        break;

      default:
        tone(520, 0.07, 0.34);
    }
  }

  function syncSoundControls() {
    const toggle =
      get("#sound-toggle");

    const slider =
      get("#volume-slider");

    const output =
      get("#volume-output");

    if (toggle) {
      toggle.textContent =
        soundEnabled
          ? "SOUND ON"
          : "SOUND OFF";

      toggle.setAttribute(
        "aria-pressed",
        String(soundEnabled)
      );
    }

    if (slider) {
      slider.value =
        String(
          Math.round(
            volume * 100
          )
        );
    }

    if (output) {
      output.textContent =
        Math.round(
          volume * 100
        ) + "%";
    }
  }


  // ==================================================
  // TOAST
  // ==================================================

  let toastTimer = null;

  function toast(message) {
    const element =
      get("#site-toast");

    if (!element) {
      return;
    }

    element.textContent =
      message;

    element.classList.add(
      "is-visible"
    );

    clearTimeout(
      toastTimer
    );

    toastTimer =
      setTimeout(
        () => {
          element.classList.remove(
            "is-visible"
          );
        },
        2200
      );
  }


  document.addEventListener(
    "site:toast",
    event => {
      if (event.detail) {
        toast(
          String(
            event.detail
          )
        );
      }
    }
  );


  // ==================================================
  // ENTRANCE
  // ==================================================

  function getGreeting() {
    const hour =
      new Date().getHours();

    if (hour < 5) {
      return "STILL UP?";
    }

    if (hour < 12) {
      return "GOOD MORNING";
    }

    if (hour < 17) {
      return "GOOD AFTERNOON";
    }

    if (hour < 22) {
      return "GOOD EVENING";
    }

    return "GOOD NIGHT";
  }

  function finishEntrance(skipAnimation = false) {
    const entrance =
      get("#entrance");

    if (!entrance) {
      document.dispatchEvent(
        new CustomEvent(
          "site:entered"
        )
      );

      return;
    }

    try {
      sessionStorage.setItem(
        "rg-entered",
        "1"
      );
    }
    catch (error) {
      // Session storage is optional.
    }

    if (skipAnimation) {
      entrance.hidden =
        true;
    }
    else {
      entrance.classList.add(
        "is-leaving"
      );

      window.setTimeout(
        () => {
          entrance.hidden =
            true;
        },
        460
      );
    }

    document.body.classList.add(
      "site-entered"
    );

    document.dispatchEvent(
      new CustomEvent(
        "site:entered"
      )
    );
  }

  function initEntrance() {
    const entrance =
      get("#entrance");

    const greeting =
      get("#entrance-greeting");

    const enterButton =
      get("#enter-site");

    if (greeting) {
      greeting.textContent =
        getGreeting();
    }

    if (!entrance) {
      return;
    }

    let alreadyEntered =
      false;

    try {
      alreadyEntered =
        sessionStorage.getItem(
          "rg-entered"
        ) === "1";
    }
    catch (error) {
      alreadyEntered =
        false;
    }

    if (alreadyEntered) {
      finishEntrance(true);
      return;
    }

    document.body.classList.add(
      "entrance-open"
    );

    if (enterButton) {
      enterButton.addEventListener(
        "click",
        () => {
          ensureAudio();
          playSound("enter");

          document.body.classList.remove(
            "entrance-open"
          );

          finishEntrance(false);
        }
      );
    }
  }


  // ==================================================
  // SETTINGS
  // ==================================================

  function openSettings() {
    const overlay =
      get("#settings-overlay");

    if (!overlay) {
      return;
    }

    closeControl(false);

    overlay.classList.add(
      "is-open"
    );

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "modal-open"
    );

    updateThemeButtons();
    syncSoundControls();

    playSound("open");
  }

  function closeSettings(withSound = true) {
    const overlay =
      get("#settings-overlay");

    if (!overlay) {
      return;
    }

    overlay.classList.remove(
      "is-open"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "modal-open"
    );

    if (withSound) {
      playSound("tick");
    }
  }

  function initSettings() {
    getAll("[data-theme-choice]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            applyTheme(
              button.dataset.themeChoice,
              true
            );
          }
        );
      });

    const fontSelect =
      get("#font-select");

    if (fontSelect) {
      fontSelect.value =
        root.dataset.font ||
        "signal";

      fontSelect.addEventListener(
        "change",
        () => {
          applyFont(
            fontSelect.value,
            true
          );
        }
      );
    }

    const soundToggle =
      get("#sound-toggle");

    if (soundToggle) {
      soundToggle.addEventListener(
        "click",
        () => {
          soundEnabled =
            !soundEnabled;

          storage.set(
            "rg-sound-enabled",
            String(soundEnabled)
          );

          syncSoundControls();

          if (soundEnabled) {
            ensureAudio();
            playSound("open");
          }
        }
      );
    }

    const volumeSlider =
      get("#volume-slider");

    if (volumeSlider) {
      volumeSlider.addEventListener(
        "input",
        () => {
          volume =
            Number(
              volumeSlider.value
            ) / 100;

          storage.set(
            "rg-volume",
            volumeSlider.value
          );

          syncSoundControls();
        }
      );

      volumeSlider.addEventListener(
        "change",
        () => {
          playSound("tick");
        }
      );
    }

    const closeButton =
      get("#close-settings");

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        () => {
          closeSettings();
        }
      );
    }

    const overlay =
      get("#settings-overlay");

    if (overlay) {
      overlay.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            overlay
          ) {
            closeSettings();
          }
        }
      );
    }

    syncSoundControls();
    updateThemeButtons();
  }


  // ==================================================
  // COMMAND CENTER
  // ==================================================

  let activeCommandIndex = 0;
  let visibleCommands = [];

  const commands = [
    {
      label: "Go to Home",
      meta: "SECTION",
      search: "home atmosphere assets top",
      target: "#home"
    },
    {
      label: "Go to Local Weather",
      meta: "SECTION",
      search: "weather local forecast location",
      target: "#weather"
    },
    {
      label: "Go to Projects",
      meta: "SECTION",
      search: "projects ventures wraps stripes business",
      target: "#projects"
    },
    {
      label: "Go to Now",
      meta: "SECTION",
      search: "now current listening reading watching working spotify",
      target: "#now"
    },
    {
      label: "Go to Experience",
      meta: "SECTION",
      search: "experience work target oneblood camp",
      target: "#experience"
    },
    {
      label: "Go to Signals",
      meta: "SECTION",
      search: "signals skills tools interests",
      target: "#signals"
    },
    {
      label: "Go to Contact",
      meta: "SECTION",
      search: "contact email linkedin phone social",
      target: "#contact"
    },
    {
      label: "Appearance + Sound",
      meta: "SETTINGS",
      search: "settings appearance theme color font sound volume",
      action: "settings"
    },
    {
      label: "Sunny Afternoon",
      meta: "THEME",
      search: "theme light sunny afternoon",
      action: "theme",
      value: "sunny"
    },
    {
      label: "Night Sky",
      meta: "THEME",
      search: "theme dark night sky",
      action: "theme",
      value: "night"
    },
    {
      label: "Storm Front",
      meta: "THEME",
      search: "theme dark storm front",
      action: "theme",
      value: "storm"
    },
    {
      label: "Golden Hour",
      meta: "THEME",
      search: "theme light golden hour amber",
      action: "theme",
      value: "golden"
    },
    {
      label: "Owner Portal",
      meta: "ADMIN",
      search: "admin owner login manage website",
      action: "admin"
    }
  ];

  function commandExists(command) {
    if (!command.target) {
      return true;
    }

    return Boolean(
      get(command.target)
    );
  }

  function getCommandQuery() {
    const input =
      get("#command-search");

    return input
      ? input.value
          .trim()
          .toLowerCase()
      : "";
  }

  function getFilteredCommands() {
    const query =
      getCommandQuery();

    const base =
      commands.filter(
        commandExists
      );

    if (
      query === "wx-42" ||
      query === "forecast 42"
    ) {
      return [
        {
          label: "Forecast 42",
          meta: "HIDDEN SIGNAL",
          search: query,
          action: "secret"
        }
      ];
    }

    if (!query) {
      return base.slice(
        0,
        9
      );
    }

    return base.filter(
      (command) =>
        (
          command.label +
          " " +
          command.meta +
          " " +
          command.search
        )
          .toLowerCase()
          .includes(query)
    );
  }

  function renderCommands() {
    const results =
      get("#command-results");

    if (!results) {
      return;
    }

    visibleCommands =
      getFilteredCommands();

    activeCommandIndex =
      Math.min(
        activeCommandIndex,
        Math.max(
          visibleCommands.length - 1,
          0
        )
      );

    results.innerHTML =
      "";

    if (
      visibleCommands.length ===
      0
    ) {
      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "command-empty";

      empty.textContent =
        "NO SIGNAL FOUND";

      results.appendChild(
        empty
      );

      return;
    }

    visibleCommands.forEach(
      (command, index) => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "command-result";

        if (
          index ===
          activeCommandIndex
        ) {
          button.classList.add(
            "is-selected"
          );
        }

        button.innerHTML =
          "<span>" +
          escapeHtml(
            command.meta
          ) +
          "</span>" +
          "<strong>" +
          escapeHtml(
            command.label
          ) +
          "</strong>" +
          "<span>↵</span>";

        button.addEventListener(
          "mouseenter",
          () => {
            activeCommandIndex =
              index;

            getAll(
              ".command-result"
            ).forEach(
              (resultButton, resultIndex) => {
                resultButton.classList.toggle(
                  "is-selected",
                  resultIndex ===
                  activeCommandIndex
                );
              }
            );
          }
        );

        button.addEventListener(
          "click",
          () => {
            runCommand(
              command
            );
          }
        );

        results.appendChild(
          button
        );
      }
    );
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      );
  }

  function openControl() {
    const overlay =
      get("#command-overlay");

    const input =
      get("#command-search");

    if (!overlay) {
      return;
    }

    closeSettings(false);

    overlay.classList.add(
      "is-open"
    );

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "modal-open"
    );

    activeCommandIndex =
      0;

    if (input) {
      input.value =
        "";

      window.setTimeout(
        () => {
          input.focus();
        },
        30
      );
    }

    renderCommands();
    playSound("open");
  }

  function closeControl(withSound = true) {
    const overlay =
      get("#command-overlay");

    if (!overlay) {
      return;
    }

    overlay.classList.remove(
      "is-open"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "modal-open"
    );

    if (withSound) {
      playSound("tick");
    }
  }

  function runCommand(command) {
    if (!command) {
      return;
    }

    if (command.target) {
      closeControl(false);

      const target =
        get(command.target);

      if (target) {
        target.scrollIntoView();
        history.replaceState(
          null,
          "",
          command.target
        );
      }

      playSound("tick");
      return;
    }

    switch (command.action) {
      case "settings":
        openSettings();
        break;

      case "theme":
        applyTheme(
          command.value,
          true
        );

        closeControl(false);
        break;

      case "admin":
        playSound("open");
        window.location.href =
          "admin.html";
        break;

      case "secret":
        unlockAurora();

        closeControl(false);

        toast(
          "FORECAST 42 · BUILD PROBABILITY 100%"
        );

        playSound("secret");
        break;

      default:
        break;
    }
  }

  function initControl() {
    const trigger =
      get("#open-control");

    const overlay =
      get("#command-overlay");

    const input =
      get("#command-search");

    if (trigger) {
      trigger.addEventListener(
        "click",
        openControl
      );
    }

    if (overlay) {
      overlay.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            overlay
          ) {
            closeControl();
          }
        }
      );
    }

    if (input) {
      input.addEventListener(
        "input",
        () => {
          activeCommandIndex =
            0;

          renderCommands();
        }
      );
    }

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.shiftKey &&
          event.key.toLowerCase() ===
          "k"
        ) {
          event.preventDefault();

          const open =
            get("#command-overlay")
              ?.classList
              .contains(
                "is-open"
              );

          if (open) {
            closeControl();
          }
          else {
            openControl();
          }

          return;
        }

        const controlOpen =
          get("#command-overlay")
            ?.classList
            .contains(
              "is-open"
            );

        const settingsOpen =
          get("#settings-overlay")
            ?.classList
            .contains(
              "is-open"
            );

        if (
          event.key ===
          "Escape"
        ) {
          if (controlOpen) {
            closeControl();
          }

          if (settingsOpen) {
            closeSettings();
          }

          return;
        }

        if (!controlOpen) {
          return;
        }

        if (
          event.key ===
          "ArrowDown"
        ) {
          event.preventDefault();

          activeCommandIndex =
            (
              activeCommandIndex +
              1
            ) %
            Math.max(
              visibleCommands.length,
              1
            );

          renderCommands();
        }

        if (
          event.key ===
          "ArrowUp"
        ) {
          event.preventDefault();

          activeCommandIndex =
            (
              activeCommandIndex -
              1 +
              Math.max(
                visibleCommands.length,
                1
              )
            ) %
            Math.max(
              visibleCommands.length,
              1
            );

          renderCommands();
        }

        if (
          event.key ===
          "Enter" &&
          visibleCommands.length
        ) {
          event.preventDefault();

          runCommand(
            visibleCommands[
              activeCommandIndex
            ]
          );
        }
      }
    );
  }


  // ==================================================
  // EASTER EGGS
  // ==================================================

  const konami = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a"
  ];

  let konamiIndex = 0;

  function unlockAurora() {
    storage.set(
      "rg-aurora-unlocked",
      "true"
    );

    const secretChoice =
      get("#aurora-theme-choice");

    if (secretChoice) {
      secretChoice.hidden =
        false;
    }

    applyTheme(
      "aurora",
      false
    );
  }

  function initEasterEggs() {
    if (
      storage.get(
        "rg-aurora-unlocked"
      ) === "true"
    ) {
      const secretChoice =
        get("#aurora-theme-choice");

      if (secretChoice) {
        secretChoice.hidden =
          false;
      }
    }

    document.addEventListener(
      "keydown",
      (event) => {
        const key =
          event.key.toLowerCase();

        if (
          key ===
          konami[
            konamiIndex
          ]
        ) {
          konamiIndex += 1;

          if (
            konamiIndex ===
            konami.length
          ) {
            konamiIndex =
              0;

            unlockAurora();

            toast(
              "AURORA WATCH UNLOCKED"
            );

            playSound("secret");
          }
        }
        else {
          konamiIndex =
            0;
        }
      }
    );

    const footer =
      get("#footer-easter");

    if (footer) {
      footer.addEventListener(
        "dblclick",
        () => {
          toast(
            "33.45°N · 88.82°W · SIGNAL ACQUIRED"
          );

          playSound("secret");
        }
      );
    }
  }


  // ==================================================
  // GENERAL INTERACTION CUES
  // ==================================================

  function initInteractionSounds() {
    getAll(
      ".navlinks a, .contact-social, .owner-link, .location-button"
    )
      .forEach((element) => {
        element.addEventListener(
          "click",
          () => {
            playSound("tick");
          }
        );
      });
  }


  // ==================================================
  // START
  // ==================================================

  applyTheme(
    root.dataset.theme ||
    "sunny",
    false
  );

  applyFont(
    root.dataset.font ||
    "signal",
    false
  );

  initSettings();
  initControl();
  initEntrance();
  initEasterEggs();
  initInteractionSounds();
})();