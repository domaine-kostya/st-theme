class CartNote extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('[data-note-input]');
    this.initNote();
  }

  initNote() {
    if (!this.input) {
      return;
    }

    let saveTimeout = null;
    this.input.addEventListener('keyup', () => {
      if (saveTimeout !== null) {
        clearTimeout(saveTimeout);
      }
      saveTimeout = setTimeout(() => {
        this.saveNote();
      }, 500);
    });

    this.input.addEventListener('blur', () => {
      this.saveNote();
    });

    window.addEventListener('cartUpdate', ({ detail: { cartData } }) => {
      if (this.input.value === cartData.note || this.input.value.length !== 0) {
        return;
      }
      this.input.value = cartData.note === null ? '' : cartData.note;
    });
  }

  saveNote() {
    window.cartAPI.cartUpdate({ note: this.input.value });
  }
}

customElements.get('cart-note') || customElements.define('cart-note', CartNote);
