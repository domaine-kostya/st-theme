import 'swiper/css/swiper.min.css';
import '@/styles/sections/featured-products.scss';

import Swiper from 'swiper';

import '@/scripts/snippets/collection-item';

class FeaturedProducts extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const featuredProductsSection = this;
    const collections = featuredProductsSection.querySelectorAll('[data-featured-products-collection]');
    const collectionToggles = featuredProductsSection.querySelectorAll('[data-featured-products-collection-toggle]');
    const carousels = featuredProductsSection.querySelectorAll('[data-featured-products-carousel]');

    if (collectionToggles.length) {
      collectionToggles.forEach((collectionToggle) => {
        collectionToggle.addEventListener('click', () => {
          const collectionHandle = collectionToggle.getAttribute('data-featured-products-collection-toggle');

          collectionToggles.forEach((toggle) => {
            if (toggle === collectionToggle) {
              toggle.classList.add('active');
            } else {
              toggle.classList.remove('active');
            }
          });

          collections.forEach((collection) => {
            if (collectionHandle === collection.getAttribute('data-featured-products-collection')) {
              collection.classList.remove('hide');

              if (siteBody.classList.contains('tab-outline')) {
                collection.focus();
              }
            } else {
              collection.classList.add('hide');
            }
          });
        });
      });
    }

    if (carousels.length) {
      carousels.forEach((carousel) => {
        const scrollbar = carousel.querySelector('[data-featured-products-scrollbar]');
        const prev = carousel
          .closest('[data-featured-products-collection]')
          .querySelector('[data-featured-products-prev]');
        const next = carousel
          .closest('[data-featured-products-collection]')
          .querySelector('[data-featured-products-next]');

        const swiper = new Swiper(carousel, {
          spaceBetween: 16,
          slidesPerView: 'auto',
          freeMode: true,
          draggable: true,
          breakpoints: {
            1025: {
              spaceBetween: 24,
              slidesPerView: 4,
              slidesPerGroup: 3,
            },
          },
          navigation: {
            prevEl: prev,
            nextEl: next,
          },
          scrollbar: {
            el: scrollbar,
            draggable: true,
          },
        });

        collectionToggles.forEach((collectionToggle) => {
          collectionToggle.addEventListener('click', () => {
            const collectionHandle = collectionToggle.getAttribute('data-featured-products-collection-toggle');
            const parentHandle = carousel
              .closest('[data-featured-products-collection]')
              .getAttribute('data-featured-products-collection');

            if (parentHandle !== collectionHandle) {
              return;
            }

            swiper.update();
          });
        });

        return swiper;
      });
    }
  }
}

customElements.get('featured-products') || customElements.define('featured-products', FeaturedProducts);
