import 'swiper/css/swiper.min.css';

import Swiper from 'swiper';
import { dispatchSwellSetup } from '@/scripts/core/helpers';

function cartRewardsInit() {
  const cartRewardsToggle = document.querySelector('[data-cart-rewards-toggle]');
  const cartRewardsToggleContent = document.querySelector('[data-cart-rewards-toggle-content]');
  const cartRewardsSubmitButtons = document.querySelectorAll('[data-cart-rewards-submit]');
  const cartRewardsCarousels = document.querySelectorAll('[data-cart-rewards-carousel]');

  if (cartRewardsToggle) {
    cartRewardsToggle.addEventListener('click', () => {
      cartRewardsToggle.classList.toggle('active');
      cartRewardsToggleContent.classList.toggle('hide');
    });
  }

  if (cartRewardsSubmitButtons.length) {
    cartRewardsSubmitButtons.forEach((cartRewardsSubmitButton) => {
      cartRewardsSubmitButton.addEventListener('click', () => {
        const productWrapper = cartRewardsSubmitButton.closest('[data-product]');
        const variantId = productWrapper.querySelector('[data-product-select]').value;

        const lineItem = {
          id: variantId,
          quantity: 1,
          properties: {
            _tier_reward: true,
          },
        };

        window.cartAPI.cartAdd(lineItem);

        cartRewardsToggle.classList.add('hide');
        cartRewardsToggle.classList.remove('active');
        cartRewardsToggleContent.classList.add('hide');
      });
    });
  }

  if (cartRewardsCarousels.length) {
    cartRewardsCarousels.forEach((cartRewardsCarousel) => {
      const prev = cartRewardsCarousel
        .closest('[data-cart-rewards-collection]')
        .querySelector('[data-cart-rewards-prev]');
      const next = cartRewardsCarousel
        .closest('[data-cart-rewards-collection]')
        .querySelector('[data-cart-rewards-next]');

      const swiper = new Swiper(cartRewardsCarousel, {
        spaceBetween: 16,
        slidesPerView: 'auto',
        freeMode: true,
        draggable: true,
        threshold: 20,
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
      });

      cartRewardsToggle.addEventListener('click', () => {
        swiper.update();
      });

      return swiper;
    });
  }
}

dispatchSwellSetup();

window.addEventListener('swell:setup:custom', () => {
  const customerDetails = window.swellAPI.getCustomerDetails();

  if (!customerDetails) return;

  showTierProducts(customerDetails);
});

function showTierProducts(customerDetails) {
  if (!customerDetails.vipTier) {
    return;
  }

  const tierName = customerDetails.vipTier.name;

  fetch('/cart?view=tier-gift-check', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'xmlhttprequest',
    },
  })
    .then((response) => response.text())
    .then((result) => {
      if (result.status) {
        throw new Error(result.description);
      }
      const responseDOMParser = new window.DOMParser();
      const responseDocument = responseDOMParser.parseFromString(result, 'text/html');
      const giftHistory = JSON.parse(responseDocument.body.innerHTML);

      if (
        giftHistory === null ||
        (tierName === 'Bronze' && giftHistory.has_tier_1 === true) ||
        (tierName === 'Silver' && giftHistory.has_tier_2 === true) ||
        (tierName === 'Gold' && giftHistory.has_tier_3 === true)
      ) {
        return;
      }

      const rewardCollections = document.querySelectorAll('[data-cart-rewards-collection]');

      rewardCollections.forEach((rewardCollection) => {
        if (rewardCollection.getAttribute('data-cart-rewards-collection') === tierName) {
          rewardCollection.classList.remove('hide');
        } else {
          rewardCollection.remove();
        }
      });

      applyDiscountCode(customerDetails, tierName);
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
}

function applyDiscountCode(customerDetails, tierName) {
  if (typeof customerDetails.actionHistoryItems === 'undefined') {
    return;
  }

  let tierReward = null;

  for (let i = 0; i < customerDetails.actionHistoryItems.length; i++) {
    const redemption = customerDetails.actionHistoryItems[i];
    if (typeof redemption.status === 'undefined' || !redemption.status) {
      continue;
    }

    if (
      (tierName === 'Bronze' && redemption.status.toLowerCase().includes('tier1gift')) ||
      (tierName === 'Silver' && redemption.status.toLowerCase().includes('tier2gift')) ||
      (tierName === 'Gold' && redemption.status.toLowerCase().includes('tier3gift'))
    ) {
      tierReward = redemption;
      break;
    }
  }

  if (!tierReward) {
    return;
  }

  const rewardsWrapper = document.querySelector('[data-cart-rewards-wrapper]');

  const checkoutTriggers = document.querySelectorAll('[data-checkout-link]');

  rewardsWrapper.classList.remove('hide');

  checkoutTriggers.forEach((trigger) => {
    const discountCode = tierReward.status;
    trigger.href = `/checkout?discount=${discountCode}`;
  });
}

window.addEventListener('cartUpdate', ({ detail: { cartData } }) => {
  const cartRewardsToggle = document.querySelector('[data-cart-rewards-toggle]');

  if (!cartRewardsToggle) {
    return;
  }

  const cartRewardsThreshold = cartRewardsToggle.getAttribute('data-cart-rewards-threshold');
  let rewardInCart = false;

  if (cartData.total_price < cartRewardsThreshold) {
    return;
  }

  cartData.items.forEach((item) => {
    if (!item.properties._tier_reward) {
      return;
    }
    rewardInCart = true;
  });

  if (rewardInCart) {
    return;
  }

  if (cartRewardsToggle) {
    cartRewardsToggle.classList.remove('hide');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  cartRewardsInit();
});
