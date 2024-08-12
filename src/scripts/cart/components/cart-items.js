import {
  cartItemTemplate,
  cartItemTemplateEmpty,
  cartItemPrice,
  bundlePrice,
  bundleChildrenDetails,
} from '@/scripts/cart/templates/cart-items-templates';
import Cookies from 'js-cookie';
import queryMetaObjectByType from '@/scripts/storefront/queries/queryMetaObjectByType';
import storefront from '@/scripts/storefront/storefront';

(() => {
  if (
    typeof window.customElements.get('cart-items') !== 'undefined' ||
    typeof window.customElements.get('cart-item') !== 'undefined'
  ) {
    return;
  }

  window.customElements.define('cart-items', class CollectionItemList extends HTMLElement { // eslint-disable-line
      constructor() {
        super();
      this.parser = new DOMParser() // eslint-disable-line
        this.promoNotices = [];
        this.loadingEl = this.querySelector('[data-cart-loading]');

        window.addEventListener('cartUpdate', async ({ detail: { cartData } }) => {
          this.loadingEl.classList.add('hide');
          this.buildList(cartData);
          await this.buildPromos(cartData);
        });
      }

      async getPromoNotices() {
        if (this.promoNotices.length) {
          return this.promoNotices;
        }
        const promoNoticesFetch = await storefront.fetch(queryMetaObjectByType('promotion_notice'));
        const promoNotices = promoNoticesFetch.metaobjects.edges
          .map((obj) => obj.node.fields)
          .map((promo) => {
            const returnValue = {};
            promo.forEach((data) => {
              returnValue[data.key] = data.value;
            });
            return returnValue;
          });
        return promoNotices;
      }

      async findPromosToDisplay(cartData) {
        const itemsToCheck = cartData.items.filter(
          (item) => !item.properties._free_gift && !item.properties._free_gift_card,
        );
        this.promoNotices = await this.getPromoNotices();

        try {
          const promosLoop = this.promoNotices.map((promo) => {
            const matchingItems = this.getMatchingItemsList(promo, itemsToCheck);
            if (!matchingItems.length) {
              return null;
            }
            const promoObject = {
              promo,
              firstMatchingItem: matchingItems[0],
              requirementMet: this.checkIfRequirementMet(promo, cartData, matchingItems),
            };
            return promoObject;
          });

          return promosLoop.filter((promo) => promo !== null);
        } catch (error) {
          console.error(error);
        }
      }

      getMatchingItemsList(promo, itemsToCheck) {
        const matchingValues = JSON.parse(promo.product_matching_values);
        const itemsLoop = itemsToCheck.map((item) => {
          switch (promo.value_match) {
            case 'Product Is Of Type':
              return matchingValues.includes(item.product_type) ? item : null;
            case 'Product has Tag':
              return item.properties._product_tags &&
                matchingValues.filter((tag) => item.properties._product_tags.split(',').includes(tag)).length
                ? item
                : null;
            case 'Product is in Collection':
              return item.properties._product_collections &&
                matchingValues.filter((collection) =>
                  item.properties._product_collections.split(',').includes(collection),
                ).length
                ? item
                : null;
            default:
              return matchingValues.includes(item.product_type) ? item : null;
          }
        });
        const matchingItems = itemsLoop.filter((item) => item !== null);
        return matchingItems;
      }

      checkIfRequirementMet(promo, cartData, matchingItems) {
        const amountNeeded = Number(promo.quantity_needed);
        const amountTotal = [...matchingItems].reduce(
          (total, item) => total + (promo.requirement_type === 'Quantity' ? item.quantity : item.line_price),
          0,
        );

        return {
          met: amountTotal >= amountNeeded,
          needsAnS: promo.requirement_type === 'Quantity' && amountNeeded - amountTotal > 1,
          amountNeeded:
            promo.requirement_type === 'Quantity'
              ? amountNeeded - amountTotal
              : `$${((amountNeeded - amountTotal) * 0.01).toFixed(2)}`,
        };
      }

      buildList(cartData) {
        if (!cartData.items || cartData.items.length === 0) {
          return;
        }
        const newItems = cartData.items.filter(
          (item) => this.querySelector(`[data-cart-item][data-key="${item.key}"]`) === null,
        );

        const softBundlesAdded = [];

        newItems.forEach((item) => {
          const childBundleProducts = checkBundleChildren(item, cartData);
          const isBundleChildProduct = typeof item.properties?._child_bundle_product !== 'undefined';
          const isSoftBundleProduct = typeof item.properties?._child_soft_bundle !== 'undefined';
          if (isBundleChildProduct) {
            return;
          }

          const elmLit =
            isSoftBundleProduct && softBundlesAdded.includes(item.properties?._child_soft_bundle)
              ? cartItemTemplateEmpty(item, childBundleProducts)
              : cartItemTemplate(item, childBundleProducts, isSoftBundleProduct, cartData.items);

          const doc = this.parser.parseFromString(elmLit, 'text/html');
          const elm = doc.querySelector('cart-item');
          if (!elm) {
            return;
          }
          this.prepend(elm);

          if (isSoftBundleProduct) {
            softBundlesAdded.push(item.properties?._child_soft_bundle);
          }
        });
      }

      async buildPromos(cartData) {
        const promos = await this.findPromosToDisplay(cartData);
        const cartItemEls = this.querySelectorAll('[data-cart-item]');

        promos
          .filter((promo) => !!promo.firstMatchingItem)
          .forEach((promo) => {
            const { key } = promo.firstMatchingItem;
            const matchingCartItemEls = [...cartItemEls].filter((el) => el.dataset.key === key);
            if (!matchingCartItemEls.length) return;
            matchingCartItemEls.forEach((cartItemEl) => {
              const promoSlot = cartItemEl.querySelector('[data-promo-slot]');
              if (!promoSlot) return;
              promoSlot.innerHTML = this.renderNotice(promo, key);
            });
          });
      }

      renderNotice(promo, key) {
        const text =
          promo.requirementMet.met === true
            ? promo.promo.requirement_met_text
            : promo.promo.promotional_text
                .replace('{s}', promo.requirementMet.needsAnS ? 's' : '')
                .replace('{amount}', promo.requirementMet.amountNeeded);
        if (text === '' || text === undefined) return '';
        return `
        <div class="cart-promo-notice cart-promo-notice--${key.replace(':', '-')} text-center">
          ${text}
        </div>
        <style>
          .cart-promo-notice--${key.replace(':', '-')} {
            --notice-txt-color: ${promo.promo.text_color};
            --notice-bg-color: ${promo.promo.background_color};
          }
        </style>
      `;
      }
    },
  );

  window.customElements.define('cart-item', class CollectionItem extends HTMLElement { // eslint-disable-line
      constructor() {
        super();
        this.key = this.getAttribute('data-key');
        this.itemData = {};
        this.bundleChildren = [];
        this.isSoftBundle = this.hasAttribute('data-cart-item-soft-bundle');

        this.initQuantitySelector();
        this.initSellingPlanSelect();
        this.initRemoveButton();
      }

      connectedCallback() {
        window.addEventListener('cartUpdate', this.handleCartUpdateEvent.bind(this));
      }

      disconnectedCallback() {
        window.removeEventListener('cartUpdate', this.handleCartUpdateEvent.bind(this));
      }

      handleCartUpdateEvent({ detail: { cartData } }) {
        this.setItemData(cartData);
      }

      setItemData(cartData) {
        this.itemData = cartData.items.find((item) => item.key === this.key);

        if (typeof this.itemData === 'undefined' || !this.itemData) {
          this.remove();
        } else {
          this.bundleChildren = checkBundleChildren(this.itemData, cartData);
          this.updateCartItem();
        }
      }

      initQuantitySelector() {
        const quantitySelector = this.querySelector('[data-quantity-input]');
        if (!quantitySelector) {
          return;
        }

        let changeTimeout = null;
        quantitySelector.addEventListener('change', () => {
          if (changeTimeout !== null) {
            clearTimeout(changeTimeout);
          }
          changeTimeout = setTimeout(() => {
            this.quantityChange(quantitySelector.value);
          }, 250);
        });
      }

      initSellingPlanSelect() {
        const sellingPlanSelect = this.querySelector('[data-selling-plan-select]');
        if (!sellingPlanSelect) {
          return;
        }

        sellingPlanSelect.addEventListener('change', async () => {
          if (!this.bundleChildren || this.bundleChildren.length === 0) {
            await window.cartAPI.cartChange({
              id: this.key,
              selling_plan: sellingPlanSelect.value,
            });
          } else {
            this.swapBundleSellingPlans(sellingPlanSelect);
          }
        });
      }

      swapBundleSellingPlans(sellingPlanSelect) {
        const itemsToSwap = this.isSoftBundle
          ? []
          : [
              {
                oldItemKey: this.key,
                newItem: {
                  id: this.itemData.id,
                  quantity: this.itemData.quantity,
                  selling_plan: sellingPlanSelect.value || null,
                  properties: this.itemData.properties,
                },
              },
            ];

        const sellingPlanName = sellingPlanSelect.options[sellingPlanSelect.selectedIndex].text;

        this.bundleChildren.forEach((childItem) => {
          try {
            const chosenPlan = JSON.parse(childItem.properties?._selling_plan_options.replace(/`/g, '"')).find(
              (option) => option.sellingPlan.name === sellingPlanName,
            );

            const chosenPlanID =
              typeof chosenPlan === 'undefined' ? null : chosenPlan.sellingPlan.id.split('SellingPlan/')[1];

            itemsToSwap.push({
              oldItemKey: childItem.key,
              newItem: {
                id: childItem.id,
                quantity: childItem.quantity,
                selling_plan: chosenPlanID,
                properties: childItem.properties,
              },
            });
          } catch (err) {
            console.error(err);
            return null;
          }
        });

        window.cartAPI.cartSwap(itemsToSwap);
      }

      initRemoveButton() {
        const removeButton = this.querySelector('[data-remove-cart-item]');
        if (!removeButton) {
          return;
        }

        removeButton.addEventListener('click', () => {
          this.quantityChange(0);
          this.classList.add('removed');
          setTimeout(() => {
            this.remove();
          }, 350);
        });
      }

      async quantityChange(newQuantity) {
        newQuantity = parseInt(newQuantity, 10);

        if (newQuantity === 0 && this.hasAttribute('data-free-gift-item')) {
          Cookies.set('removed-free-gift', true);
        }

        if (!this.bundleChildren || this.bundleChildren.length === 0) {
          const updates = {};
          updates[this.key] = newQuantity;

          await window.cartAPI.cartUpdate(
            {
              updates,
            },
            true,
          );

          return;
        }

        const itemsToUpdate = { updates: {} };
        itemsToUpdate.updates[this.key] = newQuantity;

        this.bundleChildren.forEach((childItem) => {
          itemsToUpdate.updates[childItem.key] = newQuantity;
        });

        window.cartAPI.cartUpdate(itemsToUpdate, true);
      }

      updateCartItem() {
        const priceDisplay = this.querySelector('[data-price]');
        if (priceDisplay !== null) {
          priceDisplay.innerHTML = this.hasAttribute('data-cart-item-bundle-price')
            ? bundlePrice(this.itemData.quantity, this.getAttribute('data-cart-item-bundle-price'))
            : cartItemPrice(this.itemData.final_line_price, this.itemData.original_line_price);
        }

        const quantitySelector = this.querySelector('[data-quantity-input]');
        if (quantitySelector !== null) {
          quantitySelector.value = this.itemData.quantity;
        }

        const bundleChildrenHolder = this.querySelector('[data-bundle-childen]');
        if (bundleChildrenHolder !== null) {
          const isOpen = bundleChildrenHolder.querySelector('[data-bundle-details]').hasAttribute('open');
          bundleChildrenHolder.innerHTML = bundleChildrenDetails(this.itemData, this.bundleChildren);
          if (isOpen) {
            bundleChildrenHolder.querySelector('[data-bundle-details]').setAttribute('open', true);
          }
        }
      }
    },
  );
})();

const checkBundleChildren = (item, cartData) =>
  cartData.items.filter(
    (childItem) =>
      typeof item.properties !== 'undefined' &&
      typeof childItem.properties !== 'undefined' &&
      item.properties !== null &&
      childItem.properties !== null &&
      ((typeof item?.properties?._parent_bundle_product !== 'undefined' &&
        typeof childItem.properties._child_bundle_product !== 'undefined' &&
        item.properties._parent_bundle_product === childItem.properties._child_bundle_product) ||
        (typeof item.properties._child_soft_bundle !== 'undefined' &&
          typeof childItem.properties._child_soft_bundle !== 'undefined' &&
          item.properties._child_soft_bundle === childItem.properties._child_soft_bundle)),
  );
