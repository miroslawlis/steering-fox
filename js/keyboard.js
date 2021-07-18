// https://www.youtube.com/watch?v=N3cq0BHDMOY

const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false
    },

    init(type) {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys(type));

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with input
        document.querySelectorAll("input:not(.nokeyboard)").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });

        });

        // // hide keyboard after focus is lost on input element
        // document.getElementById("wifiPassword").addEventListener("click", function(e) {

        //     if (e.path[0].localName != "input" && e.currentTarget != "div#keyboard") {
        //         Keyboard.close();
        //         Keyboard._triggerEvent("onclose");
        //     }
        // });
        // hide in youtube section
        // not working
        document.getElementById('yt-view').addEventListener('click', function (e) {

            if (e.path[0].localName != 'input' && e.currentTarget != '#keyboard') {
                Keyboard.close();
                Keyboard._triggerEvent("onclose");
            }
        });
        // hide keyboard after focus is lost on input element - for modal
        document.querySelectorAll('.background.modal').forEach(
            element => {
                element.addEventListener("click", function (e) {

                    if (e.path[0].localName != "input" && e.currentTarget != "div#keyboard") {
                        Keyboard.close();
                        Keyboard._triggerEvent("onclose");
                    }
                })
            });
    },

    // when new input element is created 'Keyboard' dont see them, 'Keyboard' needs to be reinitialized
    reinitForInputs() {

        // Automatically use keyboard for elements with input
        document.querySelectorAll("input:not(.nokeyboard)").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });

        });

        // hide in youtube section
        // not working
        document.getElementById('yt-view').addEventListener('click', function (e) {

            if (e.path[0].localName != 'input' && e.currentTarget != '#keyboard') {
                Keyboard.close();
                Keyboard._triggerEvent("onclose");
            }
        });
        // hide keyboard after focus is lost on input element - for modal
        document.querySelectorAll('.background.modal').forEach(
            element => {
                element.addEventListener("click", function (e) {

                    if (e.path[0].localName != "input" && e.currentTarget != "div#keyboard") {
                        Keyboard.close();
                        Keyboard._triggerEvent("onclose");
                    }
                })
            });
    },

    _createKeys(type) {
        const fragment = document.createDocumentFragment();
        let keyLayout = [];

        // TODO end implementation, now all keyboard will be numeric
        if (type == 'regular') {
            keyLayout = [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
                "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter",
                "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?", "space"
            ];
        } else {
            keyLayout = [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                "space", "enter"
            ];
        }

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="fas fa-${icon_name}"></i>`;
        };

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "p", "enter"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
                        this._triggerEvent("oninput");
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("arrow-up");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
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
                        document.querySelector('#yt-view').src = 'https://www.youtube.com/results?search_query=' + document.getElementById('input-for-yt').value.replace(' ', '+');
                        // cleare input
                        document.getElementById('input-for-yt').value = '';
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
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = "hide";

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                        this._triggerEvent("oninput");
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
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
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

// alert(document.URL);

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
