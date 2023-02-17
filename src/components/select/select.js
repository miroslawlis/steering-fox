class FoxSelect extends HTMLSelectElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        // Element functionality written in here
        // if needed
        // attachShadow - open means that you can access the shadow DOM using JavaScript written in the main page context, for example using the Element.shadowRoot property
        // all declaration should goes here
        // like atributes etc
    }

    connectedCallback() {
        // Invoked each time the custom element is appended into a document-connected element. 
        // This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
    }

    disconnectedCallback() {
        // Invoked each time the custom element is disconnected from the document's DOM.
    }

    static get observedAttributes() { return ['attribute-name1', 'attribute-name2']; }

    attributeChangedCallback(name, oldVal, newVal) {
        // Invoked each time one of the custom element's attributes is added, removed, or changed. 
        // Which attributes to notice change for is specified in a static get observedAttributes method
    }

    adoptedCallback() {
        // Invoked each time the custom element is moved to a new document.
    }

    customFunction() {
        
    }

}

window.customElements.define('fox-select', FoxSelect);