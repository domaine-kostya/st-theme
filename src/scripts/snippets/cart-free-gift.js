/* eslint no-underscore-dangle: 0 */
// Legacy Gift Code. Used by the "Spend X Choose Y or Z"
function cartFreeGiftInit() {
  const cartFreeGiftSubmitButtons = document.querySelectorAll('[data-cart-free-gift-submit]');
  const cartFreeGiftToggle = document.querySelector('[data-cart-free-gift-toggle]');
  const cartFreeGiftToggleContent = document.querySelector('[data-cart-free-gift-toggle-content]');

  if (cartFreeGiftToggle) {
    cartFreeGiftToggle.addEventListener('click', () => {
      cartFreeGiftToggle.classList.toggle('active');
      cartFreeGiftToggleContent.classList.toggle('hide');
    });
  }

  if (!cartFreeGiftSubmitButtons.length) {
    return;
  }

  cartFreeGiftSubmitButtons.forEach((cartFreeGiftSubmitButton, index) => {
    cartFreeGiftSubmitButton.addEventListener('click', () => {
      const freeGiftWrapper = cartFreeGiftSubmitButton.closest('[data-cart-free-gift]');
      const productWrapper = cartFreeGiftSubmitButton.closest('[data-product]');
      const selectEl = productWrapper.querySelector('[data-product-select]');
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
          _promo_type: 'spendXGetYorZ',
          _hash: hash,
          _free_gift: true,
          _free_gift_message: freeGiftWrapper.getAttribute('data-cart-free-gift-message'),
          _free_gift_threshold: Number(freeGiftWrapper.getAttribute('data-cart-free-gift-threshold')),
        },
      };

      window.cartAPI.cartAdd(lineItem, true);

      freeGiftWrapper.classList.add('hide');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cartFreeGiftInit();
});

window.addEventListener('cartUpdate', ({ detail: { cartData } }) => {
  const cartFreeGifts = document.querySelectorAll('[data-cart-free-gift]');

  if (!cartFreeGifts.length) {
    return;
  }

  cartFreeGifts.forEach((cartFreeGift, index) => {
    const freeGiftThreshold = cartFreeGift.getAttribute('data-cart-free-gift-threshold');
    const freeGiftItemInCart = cartData.items.find((_item) => _item.properties._free_gift);

    if (cartData.total_price > freeGiftThreshold && !freeGiftItemInCart) {
      const freeGiftToggle = cartFreeGift.querySelector('[data-cart-free-gift-toggle]');

      if (freeGiftToggle) {
        freeGiftToggle.classList.remove('hide');
      }

      cartFreeGift.classList.remove('hide');
    } else {
      cartFreeGift.classList.add('hide');
    }
  });
});
