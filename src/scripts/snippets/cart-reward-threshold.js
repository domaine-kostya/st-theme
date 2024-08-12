/* eslint-disable max-classes-per-file */
import 'swiper/css/swiper.min.css';

import Swiper from 'swiper';
import '@lottiefiles/lottie-player';
import { closeModals } from '@/scripts/snippets/modal';

(() => {
  if (typeof window.customElements.get('cart-reward-thresholds') !== 'undefined') {
    return;
  }

  window.customElements.define(
    'cart-reward-thresholds',
    class CartRewardThresholds extends HTMLElement {
      // eslint-disable-line
      constructor() {
        super();

        this.accordion = this.querySelector('details');
        this.giftEls = this.querySelectorAll('[data-cart-gift]');
        this.thresholdMetCount = this.querySelector('[data-available-gift-count]');
        this.accordionTitle = this.querySelector('[data-accordion-title]');
        this.swiperEl = this.querySelector('[data-gifts-wrapper]');
        this.scrollbar = this.querySelector('[data-gifts-scrollbar]');
        this.thresholdMetTitle = this.dataset.titleMet;
        this.thresholdNotMetTitle = this.dataset.titleNotMet;
        this.AllGiftInCart = true;
        this.prev = this.querySelector('[data-gifts-prev]');
        this.next = this.querySelector('[data-gifts-next]');

        this.init();
      }

      handleCartApiUpdate({ detail: { cartData } }) {
        this.updateGifts(cartData);
      }

      init() {
        window.addEventListener('cartUpdate', this.handleCartApiUpdate.bind(this));

        this.giftEls.forEach((giftEl) => {
          giftEl.addEventListener('click', () => {
            if (giftEl.hasAttribute('data-selection-required')) {
              return;
            }
            this.addGiftToCart(giftEl);
          });
        });

        this.accordion.addEventListener('toggle', () => {
          if (!this.accordion.hasAttribute('open')) {
            return;
          }

          this.swiper.update();
        });

        this.swiper = this.initSwiper();
      }

      initSwiper() {
        const swiperOptions = {
          loop: false,
          slidesPerView: 'auto',
          threshold: 5,
          observer: true,
          observeParents: true,
          initialSlide: 0,
          freeMode: true,
          spaceBetween: 16,
          scrollbar: {
            el: this.scrollbar,
            draggable: true,
          },
          navigation: {
            nextEl: this.next,
            prevEl: this.prev,
          },
        };

        return new Swiper(this.swiperEl, swiperOptions);
      }

      addGiftToCart(giftEl) {
        const id = Number(giftEl.dataset.variantId);
        const { message } = giftEl.dataset;
        const threshold = Number(giftEl.dataset.thresholdRequired) * 100;

        const lineItem = {
          id,
          quantity: 1,
          properties: {
            _type: 'chooseFreeGift',
            _promo_type: 'threshold',
            _free_gift: true,
            _free_gift_message: message,
            _free_gift_threshold: threshold,
          },
        };

        window.cartAPI.cartAdd(lineItem, true);
        giftEl.classList.add('hide');
        this.swiper.update();
      }

      updateGifts(cartData) {
        this.thresholdsMet = 0;
        this.AllGiftInCart = true;
        this.giftEls.forEach((giftEl) => {
          const id = Number(giftEl.dataset.productId);
          const threshold = Number(giftEl.dataset.thresholdRequired) * 100;

          const giftInCart = Boolean([...cartData.items].find((item) => item.product_id === id));
          giftEl.closest('.swiper-slide').classList.toggle('hide', giftInCart);

          if (giftInCart) {
            return;
          }
          if (this.AllGiftInCart === true) {
            this.AllGiftInCart = false;
          }

          giftEl.classList.toggle('locked', threshold > cartData.total_price);

          if (threshold <= cartData.total_price) {
            this.thresholdsMet++;
          }
        });

        this.thresholdMetCount.innerHTML = this.thresholdsMet;
        this.thresholdMetCount.classList.toggle('d-none', this.thresholdsMet <= 0);
        this.accordionTitle.innerHTML = this.thresholdsMet > 0 ? this.thresholdMetTitle : this.thresholdNotMetTitle;
        this.classList.toggle('d-none', this.AllGiftInCart);
      }
    },
  );
})();

(() => {
  if (typeof window.customElements.get('cart-gift-modal') !== 'undefined') {
    return;
  }

  window.customElements.define(
    'cart-gift-modal',
    class CartGiftModal extends HTMLElement {
      // eslint-disable-line
      constructor() {
        super();

        this.modal = this.closest('[data-modal]');
        this.submitButton = this.querySelector('[data-product-submit]');
        this.threshold = Number(this.dataset.threshold) * 100;
        this.message = this.dataset.message;

        this.init();
      }

      init() {
        this.submitButton.addEventListener('click', (event) => {
          event.preventDefault();
          const selectEl = this.querySelector('[data-product-select]');
          let hash = '';
          let variantId = '';

          if (selectEl) {
            const selectedOption = selectEl.selectedOptions[0];
            variantId = selectEl.value;
            hash = selectedOption?.getAttribute('data-hash') || '';
          }

          const lineItem = {
            id: variantId,
            quantity: 1,
            properties: {
              _type: 'chooseFreeGift',
              _promo_type: 'threshold',
              _hash: hash,
              _free_gift: true,
              _free_gift_message: this.message,
              _free_gift_threshold: this.threshold,
            },
          };

          window.cartAPI.cartAdd(lineItem, true);
          closeModals();
        });
      }
    },
  );
})();
