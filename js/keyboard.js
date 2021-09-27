// https://www.youtube.com/watch?v=N3cq0BHDMOY

const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: [],
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
  },

  properties: {
    value: "",
    capsLock: false,
    keyboard_type: "",
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");

    // Setup main elements
    this.elements.main.classList.add("keyboard", "keyboard--hidden");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys =
      this.elements.keysContainer.querySelectorAll(".keyboard__key");

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    // Automatically use keyboard for elements with input
    document.querySelectorAll("input:not(.nokeyboard)").forEach((element) => {
      this.properties.keyboard_type = element.type;

      element.addEventListener("focus", () => {
        this.show(element.value);
      });
    });

    document.getElementById("yt-view").addEventListener("click", function (e) {
      if (e.path[0].localName != "input" && e.currentTarget != "#keyboard") {
        Keyboard.close();
        Keyboard._triggerEvent("onclose");
      }
    });

    // hide keyboard after focus is lost on input element - for modal
    document.querySelectorAll(".background.modal").forEach((element) => {
      element.addEventListener("click", function (e) {
        if (
          e.path[0].localName != "input" &&
          e.currentTarget != "div#keyboard"
        ) {
          Keyboard.close();
          Keyboard._triggerEvent("onclose");
        }
      });
    });
  },

  // when new input element is created 'Keyboard' dont see them, 'Keyboard' needs to be reinitialized
  reinitForInputs() {
    // Automatically use keyboard for elements with input
    document.querySelectorAll("input:not(.nokeyboard)").forEach((element) => {
      this.properties.keyboard_type = element.type;

      element.addEventListener("focus", () => {
        this.show(element.value);
      });
    });

    // hide in youtube section
    // not working
    document.getElementById("yt-view").addEventListener("click", function (e) {
      if (e.path[0].localName != "input" && e.currentTarget != "#keyboard") {
        Keyboard.close();
        Keyboard._triggerEvent("onclose");
      }
    });
    // hide keyboard after focus is lost on input element - for modal
    document.querySelectorAll(".background.modal").forEach((element) => {
      element.addEventListener("click", function (e) {
        if (
          e.path[0].localName != "input" &&
          e.currentTarget != "div#keyboard"
        ) {
          Keyboard.close();
          Keyboard._triggerEvent("onclose");
        }
      });
    });
  },

  _createKeys(keyboard_type) {
    const fragmentText = document.createDocumentFragment();
    const fragmentNumeric = document.createDocumentFragment();
    let keyLayoutText = [];
    let keyLayoutNumeric = [];

    keyLayoutNumeric = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "backspace",
      "space",
      "enter",
      "TEXT",
    ];

    keyLayoutText = [
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
      "caps",
      "a",
      "s",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
      "enter",
      "done",
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      ",",
      ".",
      "?",
      "space",
      "backspace",
      "NUM",
    ];

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<i class="fas fa-${icon_name}"></i>`;
    };

    keyLayoutText.forEach((key) => {
      const keyElement = document.createElement("button");

      // Add attributes/classes
      keyElement.setAttribute("type", "button");
      keyElement.classList.add("keyboard__key");

      switch (key) {
        case "backspace":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("backspace");

          keyElement.addEventListener("click", () => {
            this.properties.value = this.properties.value.substring(
              0,
              this.properties.value.length - 1
            );
            this._triggerEvent("oninput");
          });

          break;

        case "caps":
          keyElement.classList.add(
            "keyboard__key--wide",
            "keyboard__key--activatable"
          );
          keyElement.innerHTML = createIconHTML("arrow-up");

          keyElement.addEventListener("click", () => {
            this._toggleCapsLock();
            keyElement.classList.toggle(
              "keyboard__key--active",
              this.properties.capsLock
            );
          });

          break;

        case "enter":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "enter";

          keyElement.addEventListener("click", () => {
            this.properties.value += "\n";
            this._triggerEvent("oninput");

            // pig hack for youtube
            // update webview adress with values from transprent input
            document.querySelector("#yt-view").src =
              "https://www.youtube.com/results?search_query=" +
              document.getElementById("input-for-yt").value.replace(" ", "+");
            // cleare input
            document.getElementById("input-for-yt").value = "";
            // end of pig hack
          });

          break;

        case "space":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "___";

          keyElement.addEventListener("click", () => {
            this.properties.value += " ";
            this._triggerEvent("oninput");
          });

          break;

        case "done":
          keyElement.classList.add(
            "keyboard__key--wide",
            "keyboard__key--dark"
          );
          keyElement.innerHTML = "hide";

          keyElement.addEventListener("click", () => {
            this.close();
            this._triggerEvent("onclose");
          });

          break;

        case "NUM":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = key;

          keyElement.addEventListener("click", () => {
            this.toggleNumericAndTextKeyborad("number");
          });

          break;

        default:
          keyElement.textContent = key.toLowerCase();

          keyElement.addEventListener("click", () => {
            this.properties.value += this.properties.capsLock
              ? key.toUpperCase()
              : key.toLowerCase();
            this._triggerEvent("oninput");
          });

          break;
      }

      fragmentText.appendChild(keyElement);
    });

    keyLayoutNumeric.forEach((key) => {
      const keyElement = document.createElement("button");

      // Add attributes/classes
      keyElement.setAttribute("type", "button");
      keyElement.classList.add("keyboard__key");

      switch (key) {
        case "backspace":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("backspace");

          keyElement.addEventListener("click", () => {
            this.properties.value = this.properties.value.substring(
              0,
              this.properties.value.length - 1
            );
            this._triggerEvent("oninput");
          });

          break;

        case "caps":
          keyElement.classList.add(
            "keyboard__key--wide",
            "keyboard__key--activatable"
          );
          keyElement.innerHTML = createIconHTML("arrow-up");

          keyElement.addEventListener("click", () => {
            this._toggleCapsLock();
            keyElement.classList.toggle(
              "keyboard__key--active",
              this.properties.capsLock
            );
          });

          break;

        case "enter":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "enter";

          keyElement.addEventListener("click", () => {
            this.properties.value += "\n";
            this._triggerEvent("oninput");

            // pig hack for youtube
            // update webview adress with values from transprent input
            document.querySelector("#yt-view").src =
              "https://www.youtube.com/results?search_query=" +
              document.getElementById("input-for-yt").value.replace(" ", "+");
            // cleare input
            document.getElementById("input-for-yt").value = "";
            // end of pig hack
          });

          break;

        case "space":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "___";

          keyElement.addEventListener("click", () => {
            this.properties.value += " ";
            this._triggerEvent("oninput");
          });

          break;

        case "done":
          keyElement.classList.add(
            "keyboard__key--wide",
            "keyboard__key--dark"
          );
          keyElement.innerHTML = "hide";

          keyElement.addEventListener("click", () => {
            this.close();
            this._triggerEvent("onclose");
          });

          break;

        case "TEXT":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = key;

          keyElement.addEventListener("click", () => {
            this.toggleNumericAndTextKeyborad("password");
          });

          break;

        default:
          keyElement.textContent = key.toLowerCase();

          keyElement.addEventListener("click", () => {
            this.properties.value += this.properties.capsLock
              ? key.toUpperCase()
              : key.toLowerCase();
            this._triggerEvent("oninput");
          });

          break;
      }

      fragmentNumeric.appendChild(keyElement);
    });

    let fragmentResult = document.createDocumentFragment();
    let textWrapper = document.createElement("div");
    textWrapper.appendChild(fragmentText);

    fragmentResult.appendChild(textWrapper);

    let numericWrapper = document.createElement("div");
    numericWrapper.appendChild(fragmentNumeric);
    fragmentResult.appendChild(numericWrapper);

    return fragmentResult;
  },

  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] == "function") {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        key.textContent = this.properties.capsLock
          ? key.textContent.toUpperCase()
          : key.textContent.toLowerCase();
      }
    }
  },

  show(initialValue) {
    this.properties.value = initialValue || "";
    this.elements.main.classList.remove("keyboard--hidden");

    this.toggleNumericAndTextKeyborad();
  },

  close() {
    this.properties.value = "";
    this.elements.main.classList.add("keyboard--hidden");
  },
  toggleNumericAndTextKeyborad(manual) {
    let firstkeyboard = this.elements.main.querySelector(
      ".keyboard__keys > div:first-child"
    );

    if (this.properties.keyboard_type == "number" || manual == "number") {
      firstkeyboard.style.left = "-100%";
      this.elements.main.querySelector(
        ".keyboard__keys > div:last-child"
      ).style.left = "0";
    }
    if (this.properties.keyboard_type == "password" || manual == "password") {
      firstkeyboard.style.left = "0%";
      this.elements.main.querySelector(
        ".keyboard__keys > div:last-child"
      ).style.left = "100%";
    }
  },
};

window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init();
});
