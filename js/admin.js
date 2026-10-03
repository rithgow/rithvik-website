(() => {
  "use strict";

  const REPOSITORY =
    "rithvik-website";

  const DATA_PATH =
    "data/site.json";

  const BRANCH =
    "main";

  const get = (selector) =>
    document.querySelector(selector);

  let username =
    "";

  let token =
    "";

  let currentSha =
    "";

  let currentData =
    null;


  // ==================================================
  // SESSION
  // ==================================================

  function readSession() {
    try {
      return {
        username:
          sessionStorage.getItem(
            "rg-admin-user"
          ) || "",
        token:
          sessionStorage.getItem(
            "rg-admin-token"
          ) || ""
      };
    }
    catch (error) {
      return {
        username: "",
        token: ""
      };
    }
  }

  function writeSession() {
    try {
      sessionStorage.setItem(
        "rg-admin-user",
        username
      );

      sessionStorage.setItem(
        "rg-admin-token",
        token
      );
    }
    catch (error) {
      // The portal still works until the page is refreshed.
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(
        "rg-admin-user"
      );

      sessionStorage.removeItem(
        "rg-admin-token"
      );
    }
    catch (error) {
      // No-op.
    }
  }


  // ==================================================
  // UI
  // ==================================================

  function setMessage(
    message,
    type = ""
  ) {
    const element =
      get("#admin-message");

    if (!element) {
      return;
    }

    element.textContent =
      message;

    element.classList.remove(
      "is-error",
      "is-success"
    );

    if (type) {
      element.classList.add(
        "is-" + type
      );
    }
  }

  function setLoginStatus(
    text,
    live = false
  ) {
    const status =
      get("#login-status");

    if (!status) {
      return;
    }

    status.textContent =
      text;

    status.classList.toggle(
      "admin-status-live",
      live
    );
  }

  function showEditor() {
    const editor =
      get("#editor-panel");

    if (editor) {
      editor.hidden =
        false;
    }

    setLoginStatus(
      "CONNECTED",
      true
    );
  }

  function hideEditor() {
    const editor =
      get("#editor-panel");

    if (editor) {
      editor.hidden =
        true;
    }

    setLoginStatus(
      "LOCKED",
      false
    );
  }

  function setBusy(busy) {
    getAllButtons()
      .forEach(
        button => {
          button.disabled =
            busy;
        }
      );
  }

  function getAllButtons() {
    return Array.from(
      document.querySelectorAll(
        ".admin-panel button"
      )
    );
  }


  // ==================================================
  // ENCODING
  // ==================================================

  function decodeBase64Utf8(
    base64
  ) {
    const binary =
      atob(
        base64.replace(
          /\n/g,
          ""
        )
      );

    const bytes =
      Uint8Array.from(
        binary,
        char =>
          char.charCodeAt(0)
      );

    return new TextDecoder()
      .decode(bytes);
  }

  function encodeBase64Utf8(
    text
  ) {
    const bytes =
      new TextEncoder()
        .encode(text);

    let binary =
      "";

    const chunkSize =
      0x8000;

    for (
      let index = 0;
      index < bytes.length;
      index += chunkSize
    ) {
      binary +=
        String.fromCharCode(
          ...bytes.subarray(
            index,
            index + chunkSize
          )
        );
    }

    return btoa(binary);
  }


  // ==================================================
  // GITHUB API
  // ==================================================

  async function githubRequest(
    endpoint,
    options = {}
  ) {
    if (
      !username ||
      !token
    ) {
      throw new Error(
        "Owner credentials are missing."
      );
    }

    const response =
      await fetch(
        "https://api.github.com" +
        endpoint,
        {
          ...options,
          headers: {
            "Accept":
              "application/vnd.github+json",
            "Authorization":
              "Bearer " + token,
            "X-GitHub-Api-Version":
              "2022-11-28",
            ...(options.headers || {})
          }
        }
      );

    let payload =
      null;

    try {
      payload =
        await response.json();
    }
    catch (error) {
      payload =
        null;
    }

    if (!response.ok) {
      const detail =
        payload?.message ||
        response.statusText ||
        "GitHub request failed.";

      throw new Error(
        detail +
        " (" +
        response.status +
        ")"
      );
    }

    return payload;
  }

  function contentsEndpoint() {
    return (
      "/repos/" +
      encodeURIComponent(username) +
      "/" +
      REPOSITORY +
      "/contents/" +
      DATA_PATH
    );
  }


  // ==================================================
  // LOAD / POPULATE
  // ==================================================

  async function loadData() {
    setBusy(true);

    setMessage(
      "Loading site data…"
    );

    try {
      const payload =
        await githubRequest(
          contentsEndpoint() +
          "?ref=" +
          encodeURIComponent(
            BRANCH
          )
        );

      currentSha =
        payload.sha;

      currentData =
        JSON.parse(
          decodeBase64Utf8(
            payload.content
          )
        );

      populateForm(
        currentData
      );

      showEditor();

      setMessage(
        "Connected. Editing " +
        DATA_PATH +
        " on " +
        BRANCH +
        ".",
        "success"
      );

      writeSession();
    }
    catch (error) {
      hideEditor();

      setMessage(
        error.message,
        "error"
      );

      setLoginStatus(
        "DENIED",
        false
      );

      throw error;
    }
    finally {
      setBusy(false);
    }
  }

  function populateForm(data) {
    const now =
      data.now ||
      {};

    setValue(
      "#field-updated",
      data.updated ||
      ""
    );

    setValue(
      "#field-working-title",
      now.workingTitle ||
      ""
    );

    setValue(
      "#field-working",
      Array.isArray(
        now.working
      )
        ? now.working.join(
            "\n"
          )
        : ""
    );

    setValue(
      "#field-listening",
      now.listening?.label ||
      ""
    );

    setValue(
      "#field-listening-detail",
      now.listening?.detail ||
      ""
    );

    setValue(
      "#field-spotify",
      now.listening
        ?.spotifyUrl ||
      data.socials
        ?.spotifyUrl ||
      ""
    );

    setValue(
      "#field-reading",
      now.reading?.title ||
      ""
    );

    setValue(
      "#field-reading-detail",
      now.reading?.detail ||
      ""
    );

    setValue(
      "#field-watching",
      now.watching?.title ||
      ""
    );

    setValue(
      "#field-watching-detail",
      now.watching?.detail ||
      ""
    );

    setValue(
      "#field-instagram",
      data.socials
        ?.instagram ||
      ""
    );
  }

  function setValue(
    selector,
    value
  ) {
    const element =
      get(selector);

    if (element) {
      element.value =
        value;
    }
  }

  function value(selector) {
    return (
      get(selector)?.value ||
      ""
    ).trim();
  }


  // ==================================================
  // SAVE
  // ==================================================

  function buildDataFromForm() {
    const data =
      structuredClone(
        currentData ||
        {}
      );

    data.updated =
      value(
        "#field-updated"
      ) ||
      new Date()
        .toISOString()
        .slice(0, 10);

    data.now =
      data.now ||
      {};

    data.now.workingTitle =
      value(
        "#field-working-title"
      );

    data.now.working =
      value(
        "#field-working"
      )
        .split("\n")
        .map(
          item => item.trim()
        )
        .filter(Boolean)
        .slice(0, 5);

    data.now.listening = {
      ...(data.now.listening || {}),
      label:
        value(
          "#field-listening"
        ),
      detail:
        value(
          "#field-listening-detail"
        ),
      spotifyUrl:
        value(
          "#field-spotify"
        )
    };

    data.now.reading = {
      ...(data.now.reading || {}),
      title:
        value(
          "#field-reading"
        ),
      detail:
        value(
          "#field-reading-detail"
        )
    };

    data.now.watching = {
      ...(data.now.watching || {}),
      title:
        value(
          "#field-watching"
        ),
      detail:
        value(
          "#field-watching-detail"
        )
    };

    data.socials =
      data.socials ||
      {};

    data.socials.spotifyUrl =
      value(
        "#field-spotify"
      );

    data.socials.instagram =
      value(
        "#field-instagram"
      );

    return data;
  }

  function validateUrl(
    url,
    expectedHost
  ) {
    if (!url) {
      return;
    }

    const parsed =
      new URL(url);

    if (
      !parsed.hostname
        .toLowerCase()
        .endsWith(
          expectedHost
        )
    ) {
      throw new Error(
        "Expected a " +
        expectedHost +
        " URL."
      );
    }
  }

  async function saveData() {
    if (
      !currentSha
    ) {
      throw new Error(
        "Reload the data before saving."
      );
    }

    const nextData =
      buildDataFromForm();

    validateUrl(
      nextData.now
        ?.listening
        ?.spotifyUrl ||
      "",
      "open.spotify.com"
    );

    validateUrl(
      nextData.socials
        ?.instagram ||
      "",
      "instagram.com"
    );

    setBusy(true);

    setMessage(
      "Committing update to GitHub…"
    );

    try {
      const serialized =
        JSON.stringify(
          nextData,
          null,
          2
        ) + "\n";

      const payload =
        await githubRequest(
          contentsEndpoint(),
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                message:
                  "Update Now section from owner portal",
                content:
                  encodeBase64Utf8(
                    serialized
                  ),
                sha:
                  currentSha,
                branch:
                  BRANCH
              })
          }
        );

      currentData =
        nextData;

      currentSha =
        payload.content?.sha ||
        currentSha;

      setMessage(
        "Saved. GitHub Pages will publish the update automatically.",
        "success"
      );
    }
    catch (error) {
      setMessage(
        error.message,
        "error"
      );

      throw error;
    }
    finally {
      setBusy(false);
    }
  }


  // ==================================================
  // EVENTS
  // ==================================================

  const loginForm =
    get("#login-form");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        username =
          value(
            "#admin-username"
          );

        token =
          get(
            "#admin-token"
          )?.value
            .trim() ||
          "";

        if (
          !username ||
          !token
        ) {
          setMessage(
            "Enter your GitHub username and token.",
            "error"
          );

          return;
        }

        try {
          await loadData();
        }
        catch (error) {
          // Error already displayed.
        }
      }
    );
  }

  const contentForm =
    get("#content-form");

  if (contentForm) {
    contentForm.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        try {
          await saveData();
        }
        catch (error) {
          // Error already displayed.
        }
      }
    );
  }

  get("#reload-button")
    ?.addEventListener(
      "click",
      async () => {
        try {
          await loadData();
        }
        catch (error) {
          // Error already displayed.
        }
      }
    );

  get("#logout-button")
    ?.addEventListener(
      "click",
      () => {
        username =
          "";

        token =
          "";

        currentSha =
          "";

        currentData =
          null;

        clearSession();
        hideEditor();

        const tokenInput =
          get("#admin-token");

        if (tokenInput) {
          tokenInput.value =
            "";
        }

        setMessage(
          "Logged out.",
          "success"
        );
      }
    );


  // ==================================================
  // AUTO-RECONNECT THIS TAB
  // ==================================================

  const session =
    readSession();

  if (
    session.username &&
    session.token
  ) {
    username =
      session.username;

    token =
      session.token;

    setValue(
      "#admin-username",
      username
    );

    const tokenInput =
      get("#admin-token");

    if (tokenInput) {
      tokenInput.value =
        token;
    }

    loadData()
      .catch(
        () => {
          clearSession();
        }
      );
  }
})();