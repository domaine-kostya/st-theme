(() => {
  if (typeof window.customElements.get('collection-item') !== 'undefined') {
    return;
  }

  window.customElements.define('collection-item', class Ajaxcart extends HTMLElement { // eslint-disable-line
      constructor() {
        super();
        this.swatchParent = this.querySelector('[data-collection-item-swatches]');
        this.swatches = this.querySelectorAll('[data-collection-item-swatch]');
        this.priceElement = this.querySelector('[data-collection-item-price]');
        this.soldOutElement = this.querySelector('[data-collection-item-sold-out]');
        this.regularPriceElement = this.querySelector('[data-collection-item-sale-price]');
        this.compareAtPriceElement = this.querySelector('[data-collection-item-compare-price]');
        this.saleBadge = this.querySelector('[data-collection-item-sale-badge]');

        this.initSwatches();
      }

      initSwatches() {
        if (!this.swatches.length) {
          return;
        }

        this.swatches.forEach((collectionItemSwatch) => {
          collectionItemSwatch.addEventListener('click', () => {
            this.handleSwatchClick(collectionItemSwatch);
          });
        });

        this.setActiveSwatch();
      }

      handleSwatchClick(swatch) {
        const swatchAvaialble = swatch.getAttribute('data-available') === 'true';

        // Update image
        if (swatch.hasAttribute('data-variant-image')) {
          const collectionItemImage = this.querySelector('[data-collection-item-image] img');
          const variantImage = swatch.getAttribute('data-variant-image');
          const siblingSwatches = this.querySelectorAll('[data-collection-item-swatch]');

          if (!collectionItemImage) {
            return;
          }

          siblingSwatches.forEach((_swatch) => {
            _swatch.classList.toggle('active', _swatch === swatch);
          });

          collectionItemImage.removeAttribute('srcset');
          collectionItemImage.setAttribute('src', variantImage);
        }

        // Update price
        this.priceElement.classList.toggle('d-none', !swatchAvaialble);
        this.soldOutElement.classList.toggle('d-none', swatchAvaialble);

        if (swatch.hasAttribute('data-compare-price')) {
          if (this.compareAtPriceElement) {
            this.compareAtPriceElement.classList.remove('d-none');
            this.compareAtPriceElement.innerHTML = swatch.getAttribute('data-compare-price');
          }

          if (this.regularPriceElement) {
            this.regularPriceElement.classList.add('sale-price');
            this.regularPriceElement.innerHTML = swatch.getAttribute('data-regular-price');
          }

          if (this.saleBadge) {
            this.saleBadge.classList.remove('d-none');
          }
        } else {
          if (this.compareAtPriceElement) {
            this.compareAtPriceElement.classList.add('d-none');
          }

          if (this.regularPriceElement) {
            this.regularPriceElement.classList.remove('sale-price');
            this.regularPriceElement.innerHTML = swatch.getAttribute('data-regular-price');
          }

          if (this.saleBadge) {
            this.saleBadge.classList.add('d-none');
          }
        }
      }

      setActiveSwatch() {
        const activeSwatch = this.swatchParent.querySelector('[data-collection-item-swatch].active');

        if (activeSwatch) {
          return;
        }

        const firstSwatch = this.swatchParent.querySelector('[data-collection-item-swatch]');

        firstSwatch.classList.add('active');

        this.handleSwatchClick(firstSwatch);
      }
    },
  );
})();
