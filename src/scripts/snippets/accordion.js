class accordion extends HTMLElement {
  constructor() {
    super();
    this.closing = false;
    this.details = this.querySelector('details');
    this.summary = this.querySelector('summary');

    if (this.dataset.group) {
      this.uniqueId = Math.floor(Math.random() * 9999999);
    }
  }

  connectedCallback() {
    this.summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.classList.contains('animating')) {
        return;
      }

      if (this.details.open) {
        this.close();
      } else {
        this.open();
      }
    });

    this.addEventListener('transitionend', (event) => {
      this.style.height = null;
      this.classList.remove('animating');

      if (this.closing) {
        this.details.open = false;
        this.closing = false;
      }
    });
  }

  open() {
    if (this.details.open === true) {
      return;
    }

    this.style.height = `${this.summary.offsetHeight}px`;
    this.details.open = true;
    this.classList.add('animating');
    this.style.height = `${this.details.offsetHeight}px`;
    this.closing = false;

    this.closeGroupSiblings();
  }

  close() {
    if (this.details.open === false) {
      return;
    }

    this.style.height = `${this.details.offsetHeight}px`;
    this.classList.add('animating');
    this.style.height = `${this.summary.offsetHeight}px`;
    this.closing = true;
  }

  closeGroupSiblings() {
    if (!this.dataset.group || !this.uniqueId) {
      return;
    }

    const groupAccordions = document.querySelectorAll(`custom-accordion[data-group="${this.dataset.group}"]`);
    groupAccordions.forEach((groupAccordion) => {
      if (groupAccordion.uniqueId === this.uniqueId) {
        return;
      }
      groupAccordion.close();
    });
  }
}

// Add support for their default accordions,
// they will eventually use metafields insteaad
function legacyAccordions() {
  const accordions = document.querySelectorAll('[data-legacy-product-description] .accordion');
  const productDescription = document.querySelector('[data-legacy-product-description]');

  if (!accordions.length) {
    return;
  }

  productDescription.innerHTML = '';

  accordions.forEach((accordion, index) => {
    const accordionTitle = accordion.getAttribute('id').replace(/-/g, ' ');
    const accordionContent = accordion.innerHTML;
    const accordionElement = document.createElement('div');

    accordionElement.innerHTML = `
      <custom-accordion class="accordion" data-accordion>
        <details ${index === 0 ? 'open' : ''}>
          <summary class="accordion__toggle ui-button">
            ${accordionTitle}

            <svg class="icon-plus" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.25 8.25H9.75002V3.75C9.75002 3.30001 9.45001 3 9.00001 3C8.55001 3 8.25001 3.30001 8.25001 3.75V8.25H3.75001C3.30001 8.25 3 8.55 3 9C3 9.45 3.30001 9.75001 3.75001 9.75001H8.25001V14.25C8.25001 14.7 8.55001 15 9.00001 15C9.45001 15 9.75002 14.7 9.75002 14.25V9.75001H14.25C14.7 9.75001 15 9.45 15 9C15 8.55 14.7 8.25 14.25 8.25V8.25Z" fill="black"/>
            </svg>

            <svg class="icon-minus" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.25 8.25H3.74999C3.29999 8.25 2.99998 8.55001 2.99998 9.00001C2.99998 9.45001 3.29999 9.75001 3.74999 9.75001H14.25C14.7 9.75001 15 9.45001 15 9.00001C15 8.55001 14.7 8.25 14.25 8.25V8.25Z" fill="black"/>
            </svg>
          </summary>

          <div class="accordion__content">
            ${accordionContent}
          </div>
        </details>
      </custom-accordion>
    `;

    productDescription.appendChild(accordionElement);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('custom-accordion', accordion);
  legacyAccordions();
});
