import { trapFocus, removeTrapFocus } from '@/scripts/core/a11y';
import { scrollLockOpen, scrollLockClose } from '@/scripts/core/scroll-lock';

class Ajaxcart extends HTMLElement {
  constructor() {
    super();

    this.open = false;
    this.itemsInCart = null;
    this.siteOverlay = document.querySelector('[data-site-overlay]');
    this.takeOver = document.querySelector('ajax-cart-takeover');
    this.cartEl = this.querySelector('custom-cart');
    this.initToggles();
  }

  initToggles() {
    if (!this.cartEl) {
      return;
    }

    window.addEventListener('cartUpdate', ({ detail: { cartData } }) => {
      if (this.itemsInCart !== null && this.itemsInCart < cartData.item_count) {
        if (document.body.classList.contains('template-cart')) {
          window.scrollTo(0, 0);
        } else {
          this.openAjaxcart();
        }
      }

      this.itemsInCart = cartData.item_count;
    });

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || this.open === false) {
        return;
      }
      this.closeAjaxcart();
    });

    document.querySelectorAll('[data-open-ajaxcart]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        this.openAjaxcart();
      });
    });

    document.querySelectorAll('[data-close-ajaxcart]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        this.closeAjaxcart();
      });
    });

    if (window.location.href.split('?')[1]?.includes('cart_redirect')) {
      this.openAjaxcart();
    }

    if (this.siteOverlay !== null) {
      this.siteOverlay.addEventListener('click', () => {
        this.closeAjaxcart();
      });
    }
  }

  openAjaxcart() {
    this.open = true;
    this.classList.add('open');
    trapFocus(this);
    scrollLockOpen();
    this.toggleTakeover(true);

    if (!this.siteOverlay) {
      return;
    }
    this.siteOverlay.classList.add('active');
  }

  closeAjaxcart() {
    this.open = false;
    this.classList.remove('open');
    removeTrapFocus(this);
    scrollLockClose();
    this.toggleTakeover(false);
    if (!this.siteOverlay) {
      return;
    }
    this.siteOverlay.classList.remove('active');
  }

  toggleTakeover(active) {
    this.takeOver?.classList.toggle('active', active);
  }
}

customElements.get('ajax-cart') || customElements.define('ajax-cart', Ajaxcart);
