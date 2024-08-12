import shipper from './shopify-shipping-calculator/src/index';
import queryCartProductData from '@/scripts/storefront/queries/queryCartProductData';
import storefront from '@/scripts/storefront/storefront';

// Snippets
import '@/scripts/snippets/cart-rewards';
import '@/scripts/snippets/cart-free-gift';

/* eslint no-underscore-dangle: 0 */
class CustomCart extends HTMLElement {
  constructor() {
    super();

    this.cartData = {};

    this.cartSpendingTiersElement = document.querySelector('[data-cart-spending-tiers]');

    this.cartItemsEl = this.querySelector('cart-items');

    this.activePromos = {
      threshold: this.getAttribute('data-spend-threshold-gifts-promo-active') === 'true',
      spendXGetYorZ: this.getAttribute('data-spend-x-get-y-or-z-gift-promo-active') === 'true',
      giftcard: this.getAttribute('data-giftcard-promo-active') === 'true',
      spendingTiers: this.getAttribute('data-spending-tiers-promo-active') === 'true',
    };

    window.addEventListener('cartApiUpdate', async ({ detail: { cartData } }) => {
      this.cartData = cartData;
      await this.handleCartUpdate();
    });

    this.shippingCalculator();
  }

  async handleCartUpdate() {
    const functionsToRun = [
      this.handleSpendingTiers,
      this.handleGiftCardTiers,
      this.checkPromoProperties,
      this.checkBundles,
      this.freeGiftCheck,
      this.freeGiftBar,
    ];

    for (const functionToRun of functionsToRun) {
      const functionResult = await functionToRun.bind(this)();
      if (functionResult) {
        await this.handleCartUpdate();
        break;
      }
    }

    this.dispatchCartUpdate();
  }

  dispatchCartUpdate() {
    window.dispatchEvent(
      new CustomEvent('cartUpdate', {
        // eslint-disable-line
        detail: {
          cartData: this.cartData,
        },
      }),
    );
  }

  // Fallback for products added through limespot, check for properties and add them if they don't exist
  async checkPromoProperties() {
    this.promoNotices = this.cartItemsEl?.promoNotices || [];

    if (this.cartData?.items?.length === 0 || !this.promoNotices.length) {
      return;
    }

    const itemsMissingProperties = this.cartData.items.filter(
      (item) =>
        !item.properties._free_gift_card &&
        !item.properties._free_gift &&
        !item.properties._product_tags &&
        !item.properties._product_collections,
    );

    if (!itemsMissingProperties.length) {
      return false;
    }

    const productDatasRes = itemsMissingProperties.map((item) =>
      storefront.fetch(queryCartProductData(item.product_id)),
    );
    const productData = await Promise.allSettled(productDatasRes);

    const propItemsResponse = itemsMissingProperties.map(async (item) => {
      const matchingProductData = productData.find((_data) => _data.value?.product.handle === item.handle);
      if (!matchingProductData) {
        return Promise.reject(new Error('no data'));
      }

      const itemTagsList = matchingProductData.value.product.tags.toString();
      const itemCollectionsList = matchingProductData.value.product.collections.edges
        .map((obj) => obj.node.title)
        .toString();

      return window.cartAPI.cartChange({
        id: item.key,
        quantity: item.quantity,
        properties: {
          ...item.properties,
          _product_tags: itemTagsList,
          _product_collections: itemCollectionsList,
        },
      });
    });

    await this.setCartDataFromPromiseArray(propItemsResponse);

    return false;
  }

  async checkBundles() {
    let updateMade = false;

    if (!this.cartData.items) {
      return;
    }

    this.cartData.items.forEach(async (item) => {
      if (!item.properties._bundle_id || item.properties._parent_bundle_children_titles) {
        return;
      }

      let hasParent = false;

      this.cartData.items.forEach((lineItem) => {
        if (
          lineItem.properties._bundle_id === item.properties._bundle_id &&
          lineItem.properties._parent_bundle_children_titles
        ) {
          hasParent = true;
        }
      });

      if (hasParent === false) {
        const lineItem = {
          id: item.key,
          quantity: 0,
        };

        this.cartData = await window.cartAPI.cartChange(lineItem);
        updateMade = true;
      }
    });

    return updateMade;
  }

  async handleGiftCardTiers() {
    const currentGiftCardItems = this.cartData.items.filter(
      (_item) => typeof _item.properties._free_gift_card !== 'undefined',
    );
    let updateMade = '';

    // Remove all free gift cards if promo not active
    if (this.activePromos.giftcard !== true) {
      if (currentGiftCardItems.length) {
        const updates = currentGiftCardItems.reduce((updates, _item) => {
          updates[_item.key] = 0;
          return updates;
        }, {});

        this.cartData = await window.cartAPI.cartUpdate({ updates });
      }

      return currentGiftCardItems.length;
    }

    const cartGiftCardTiersElement = document.querySelector('[data-cart-gift-card-tiers]');
    const cartGiftCardTiers = JSON.parse(cartGiftCardTiersElement.getAttribute('data-cart-gift-card-tiers'));
    const currentTier = cartGiftCardTiers.filter((tier) => this.cartData.total_price > tier.threshold).at(-1);

    const currentGiftCardItemIds = currentGiftCardItems.map((item) => item.id);

    // Add active giftcard
    if (currentTier && !currentGiftCardItemIds.includes(currentTier.variant)) {
      const lineItem = {
        id: currentTier.variant,
        quantity: 1,
        properties: {
          _free_gift_card_threshold: currentTier.threshold,
          _free_gift_card: true,
          _promo_type: 'giftcard',
          _hash: currentTier.hash,
          _type: 'chooseFreeGift',
        },
      };

      this.cartData = await window.cartAPI.cartAdd(lineItem);
      updateMade = true;
    }

    // Remove invalid gift cards
    const itemsToRemove = currentGiftCardItems.filter((_item) => !currentTier || currentTier.variant !== _item.id);
    if (itemsToRemove.length) {
      const updates = itemsToRemove.reduce((updates, _item) => {
        updates[_item.key] = 0;
        return updates;
      }, {});

      this.cartData = await window.cartAPI.cartUpdate({ updates });

      updateMade = true;
    }

    return updateMade;
  }

  async handleSpendingTiers() {
    if (this.activePromos.spendingTiers === true) {
      const productsToExclude = JSON.parse(this.cartSpendingTiersElement.getAttribute('data-products-to-exclude'));
      const itemsToUpdate = this.cartData.items.filter(
        (_item) =>
          !productsToExclude.includes(_item.handle) &&
          !_item.properties._tier_discount &&
          !_item.properties._free_gift &&
          !_item.properties._free_gift_card,
      );

      const addTierPropsResponse = itemsToUpdate.map((item) => {
        const lineItem = {
          id: item.key,
          quantity: item.quantity,
          properties: {
            ...item.properties,
            _tier_discount: true,
          },
        };

        return window.cartAPI.cartChange(lineItem);
      });

      await this.setCartDataFromPromiseArray(addTierPropsResponse);

      return itemsToUpdate.length;
    }
    const itemsToChange = this.cartData.items.filter((_item) => typeof _item.properties._tier_discount !== 'undefined');

    const removeTierProps = itemsToChange.map((item) => {
      const newProps = { ...item.properties };
      delete newProps._tier_discount;

      const lineItem = {
        id: item.key,
        quantity: item.quantity,
        properties: {
          newProps,
        },
      };

      return window.cartAPI.cartChange(lineItem);
    });

    await this.setCartDataFromPromiseArray(removeTierProps);

    return itemsToChange.length;
  }

  shippingCalculator() {
    if (!window.Countries) {
      return;
    }

    const shippingEstimateToggle = this.querySelector('[data-cart-shipping-estimate-toggle]');
    const shippingEstimate = this.querySelector('[data-cart-shipping-estimate]');
    const shippingEstimateForm = this.querySelector('[data-cart-shipping-estimate-form]');
    const shippingEstimateResults = this.querySelector('[data-cart-shipping-estimate-results]');

    if (!shippingEstimateForm) {
      return;
    }

    const shippingCalculator = shipper(shippingEstimateForm, {
      defaultCountry: 'United States',
    });

    shippingCalculator.on('success', (rates) => {
      shippingEstimateResults.innerHTML = '';

      rates.forEach((rate) => {
        shippingEstimateResults.innerHTML += `
        <li><strong>${rate.type}</strong>: $${rate.price}</li>
      `;
      });
    });

    shippingCalculator.on('error', (res) => {
      shippingEstimateResults.innerHTML = `<strong style="color:#FF8671;">${res}</strong>`;
      console.warn(res);
    });

    shippingEstimateToggle.addEventListener('click', () => {
      shippingEstimateToggle.classList.toggle('active');
      shippingEstimate.classList.toggle('hide');
    });
  }

  async freeGiftCheck() {
    if (!this.cartData?.items) {
      return false;
    }

    const giftsInCart = this.cartData.items.filter(
      (item) => item.properties._free_gift !== null && item.properties._free_gift === true,
    );

    if (!giftsInCart.length) {
      return false;
    }

    const activeGiftTypes = Object.entries(this.activePromos)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key);

    // Check gifts still above thresholds and that quantity === 1
    const giftChecks = giftsInCart
      .filter(
        (gift) =>
          !activeGiftTypes.includes(gift.properties._promo_type) ||
          !(this.cartData.total_price > gift.properties._free_gift_threshold && gift.quantity === 1),
      )
      .map((gift) => {
        const updates = {};
        updates[gift.key] =
          activeGiftTypes.includes(gift.properties._promo_type) &&
          this.cartData.total_price > gift.properties._free_gift_threshold
            ? 1
            : 0;

        return window.cartAPI.cartUpdate({
          updates,
        });
      });

    await this.setCartDataFromPromiseArray(giftChecks);

    return giftChecks.length;
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async setCartDataFromPromiseArray(promises) {
    const promisesResponse = await Promise.allSettled(promises);
    const successfulResponses = promisesResponse.filter((response) => response.status === 'fulfilled');

    if (!successfulResponses.length) return false;

    await this.wait(200);

    this.cartData = await cartAPI.cartFetch();
  }

  freeGiftBar() {
    const fsbs = document.querySelectorAll('[data-fsb]');
    if (!fsbs.length) {
      return;
    }

    fsbs.forEach((fsb) => {
      const threshold = parseInt(fsb.getAttribute('data-fsb'), 10) * 100;
      const bar = fsb.querySelector('[data-fsb-bar]');
      const text = fsb.querySelector('[data-fsb-text]');

      if (bar !== null) {
        const barPercent = (this.cartData.total_price / threshold) * 100;
        bar.style.width = `${barPercent > 100 ? 100 : barPercent}%`;
      }

      if (text !== null) {
        text.innerHTML =
          this.cartData.total_price >= threshold
            ? text.getAttribute('data-qualified-text')
            : text
                .getAttribute('data-unqualified-text')
                .replace(
                  /\[amount\]/g,
                  `<strong>${Shopify.formatMoney(threshold - this.cartData.total_price).replace('.00', '')}</strong>`,
                );
      }
    });
  }
}

customElements.get('custom-cart') || customElements.define('custom-cart', CustomCart);
