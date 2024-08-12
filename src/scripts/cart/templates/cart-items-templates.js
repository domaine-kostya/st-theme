/* eslint no-underscore-dangle: 0 */
export const cartItemTemplate = (item, childBundleProducts, isSoftBundleProduct, cartItems) => {
  const itemTitle =
    isSoftBundleProduct && item.properties?._soft_bundle_title
      ? item.properties?._soft_bundle_title
      : item.product_title;

  const itemURL =
    isSoftBundleProduct && item.properties?._soft_bundle_url ? item.properties?._soft_bundle_url : item.url;

  const bundleProductHandle = item.properties?._bundle_handle;
  const bundleProductTitle = item.properties?._bundle_title;
  const bundleProductImage = item.properties?._bundle_image;
  const bundleProductPrice = item.properties?._bundle_total_price;
  const bundleProductChildrenTitles = item.properties?._parent_bundle_children_titles;
  const isFreeGift = item.properties?._free_gift;
  const freeGiftMessage = item.properties?._free_gift_message;
  const isTierReward = item.properties?._tier_reward;
  const isFreeGiftCard = item.properties?._free_gift_card;

  return `
    <cart-item class="cart-item ${isSoftBundleProduct ? 'cart-item--soft-bundle' : ''} ${
      isFreeGift ? 'cart-item--free-gift' : ''
    } ${isTierReward ? 'cart-item--reward' : ''} ${isFreeGiftCard ? 'cart-item--free-gift-card' : ''}"
      data-cart-item
      data-key="${item.key}"
      data-id="${item.id}"
      data-product-id="${item.product_id}"
      ${isFreeGift ? 'data-free-gift-item' : ''}
      ${bundleProductPrice ? `data-cart-item-bundle-price="${bundleProductPrice}"` : ''}
      ${isSoftBundleProduct ? 'data-cart-item-soft-bundle' : ''}
    >
      <a href="${bundleProductHandle ? `/products/${bundleProductHandle}` : itemURL}" class="cart-item__image-holder">
        ${
          isFreeGift || isFreeGiftCard || isTierReward
            ? `<div class="cart-item__badge">${
                isTierReward ? window.theme.strings.reward : window.theme.strings.freeGift
              }</div>`
            : ''
        }
        ${
          bundleProductImage
            ? `<img src="${bundleProductImage}" width="800" height="800" loading="lazy" alt="Image of ${
                bundleProductTitle || itemTitle
              }">`
            : `<img src="${Shopify.Image.getSizedImageUrl(
                item.image || item.featured_image.url,
                '800x',
              )}" width="800" height="800" loading="lazy" alt="Image of ${itemTitle}">`
        }
      </a>

      <div class="cart-item__info-holder">
        ${
          isFreeGift || isTierReward
            ? `
            <span class="cart-item__link">
              <strong class="cart-item__title p--small">
                ${isTierReward ? window.theme.strings.rewardsMessage : freeGiftMessage}
              </strong>

              <br>

              <span>
                ${itemTitle}
              </span>
            </span>
          `
            : `
            <a href="${bundleProductHandle ? `/products/${bundleProductHandle}` : itemURL}" class="cart-item__link">
              <strong class="cart-item__title p--small">
                ${bundleProductTitle || itemTitle}
              </strong>
            </a>
          `
        }

        ${
          !item.variant_title || bundleProductChildrenTitles
            ? `<p class="cart-item__variant-title p--small">${bundleProductChildrenTitles.replace(',', '<br>')}</p>`
            : `<p class="cart-item__variant-title p--small">${item.variant_title}</p>`
        }

        ${cartItemProperties(item)}

        ${
          item.properties._final_sale === true
            ? `<p class="cart-item__sale-message">
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.3844 8.82375L9.17688 2.61626C9.06114 2.49976 8.92343 2.40739 8.77173 2.34452C8.62002 2.28165 8.45735 2.24953 8.29313 2.25001H2.50001C2.30109 2.25001 2.11033 2.32902 1.96968 2.46968C1.82902 2.61033 1.75001 2.80109 1.75001 3.00001V8.79313C1.74953 8.95735 1.78165 9.12002 1.84452 9.27173C1.90739 9.42343 1.99976 9.56114 2.11626 9.67688L8.32375 15.8844C8.55816 16.1187 8.87605 16.2504 9.20751 16.2504C9.53896 16.2504 9.85685 16.1187 10.0913 15.8844L15.3844 10.5913C15.6187 10.3568 15.7504 10.039 15.7504 9.70751C15.7504 9.37605 15.6187 9.05816 15.3844 8.82375ZM9.20751 14.6469L3.25001 8.68751V3.75001H8.18751L14.145 9.70751L9.20751 14.6469ZM6.25001 5.75001C6.25001 5.94779 6.19136 6.14113 6.08147 6.30558C5.97159 6.47002 5.81541 6.5982 5.63269 6.67388C5.44996 6.74957 5.2489 6.76938 5.05491 6.73079C4.86093 6.69221 4.68275 6.59696 4.5429 6.45711C4.40305 6.31726 4.30781 6.13908 4.26922 5.9451C4.23063 5.75111 4.25044 5.55005 4.32613 5.36732C4.40181 5.1846 4.52999 5.02842 4.69444 4.91854C4.85888 4.80865 5.05222 4.75001 5.25001 4.75001C5.51522 4.75001 5.76958 4.85536 5.95711 5.0429C6.14465 5.23044 6.25001 5.48479 6.25001 5.75001Z" fill="#CF1F00"/>
            </svg>
            ${theme.strings.final_sale}</p>`
            : ''
        }

        <div class="cart-item__quantity-and-price">
          <p class="cart-item__price ${isFreeGift || isFreeGiftCard || isTierReward ? 'hide' : ''}" data-price>
            ${
              bundleProductPrice
                ? bundlePrice(item.quantity, bundleProductPrice)
                : cartItemPrice(item.final_line_price, item.original_line_price)
            }
          </p>
          ${quantitySelectorTemplate(item)}
        </div>

        <button class="cart-item__remove" data-remove-cart-item aria-label="Remove ${itemTitle} from cart">
          ${window.theme.icons.trash}
        </button>

        ${sellingPlanSelect(item)}

        <div data-promo-slot></div>
      </div>
    </cart-item>
  `;
};

export const cartItemTemplateEmpty = (item, childBundleProducts) => `
    <cart-item class="cart-item hide"
      data-cart-item
      data-cart-item-empty
      data-key="${item.key}"
      data-id="${item.id}"
      data-product-id="${item.product_id}"
    >
    </cart-item>
  `;

export const cartItemPrice = (finalLinePrice, originalLinePrice = 0) =>
  originalLinePrice > finalLinePrice
    ? `<span>${Shopify.formatMoney(finalLinePrice)}</span> <s>${Shopify.formatMoney(originalLinePrice)}</s>`
    : Shopify.formatMoney(finalLinePrice);

export const cartItemProperties = (item) => {
  if (typeof item.properties === 'undefined' || !item.properties || Object.keys(item.properties).length === 0) {
    return '';
  }

  return `
    <ul class="cart-item__properties p--small">
      ${Object.keys(item.properties)
        .map((property) => {
          if (property.charAt(0) === '_') {
            return '';
          }
          return `<li>${property}: ${item.properties[property]}</li>`;
        })
        .join('')}
    </ul>
  `;
};

export function bundlePrice(itemQuantity, bundleProductPrice) {
  const finalPrice = itemQuantity * bundleProductPrice;

  return Shopify.formatMoney(finalPrice);
}

export const bundleChildrenPrice = (item, bundleChildren) => {
  if (bundleChildren.length === 0) {
    return '$0';
  }
  const finalBundleChildrenPrice = bundleChildren.reduce((prev, cur) => prev + cur.final_line_price, 0);
  return Shopify.formatMoney(finalBundleChildrenPrice);
};

export const bundleChildrenDetails = (item, bundleChildren) => {
  if (bundleChildren.length === 0) {
    return '';
  }

  return `
    <details class="cart-item__bundle-children" data-bundle-details>
      <summary>
        <span>
          ${window.theme.icons.plus}
          ${window.theme.icons.minus}
          ${window.theme.strings.bundledProducts}
        </span>

        <span>
          ${bundleChildrenPrice(item, bundleChildren)}
        </span>
      </summary>

      <ul>
        ${bundleChildren
          .map(
            (childItem) => `
            <li>
              <span>
                ${childItem.product_title}
                ${!childItem.variant_title ? '' : `<br> <span class="p--small">${childItem.variant_title}</span>`}
              </span>

              <span>
                ${cartItemPrice(childItem.final_line_price)}
              </span>
            </li>
          `,
          )
          .join('')}
      </ul>
    </detials>
  `;
};

export const sellingPlanSelect = (item) => {
  try {
    const planOptionsString = item.properties?._selling_plan_options;
    if (typeof planOptionsString === 'undefined' || !planOptionsString) {
      return '';
    }

    const planOptions = JSON.parse(planOptionsString.replace(/`/g, '"'));
    const sellingPlanCurrent = item.selling_plan_allocation?.selling_plan?.id;
    if (!planOptions || planOptions.length === 0) {
      return '';
    }

    return `
      <dropdown-select class="cart-item__selling-plan-select">
        <select data-selling-plan-select>
          <option
            value
            ${!sellingPlanCurrent ? 'selected' : ''}
          >
            ${window.theme.strings.sellingPlanSingle}
          </option>
          ${planOptions
            .map(
              (option) => `
              <option
                value="${option.sellingPlan.id.split('SellingPlan/')[1]}"
                ${
                  option.sellingPlan.id.split('SellingPlan/')[1] === sellingPlanCurrent?.toString() &&
                  sellingPlanCurrent
                    ? 'selected'
                    : ''
                }
              >
                ${option.sellingPlan.name}
              </option>
            `,
            )
            .join('')}
        </select>
      </dropdown-select>
    `;
  } catch (err) {
    console.error(err);
    return '';
  }
};

export const quantitySelectorTemplate = (item) => `
    <quantity-selector>
      <div class="cart-item__quantity-selector quantity-selector">
        <button class="quantity-selector__btn" type="button"
          data-quantity-button
          data-action="minus"
          aria-label="Minus ${item.title.replace(/"/g, '&quot;')} Quantity"
        >${window.theme.icons.qtyMinus}</button>

        <input class="quantity-selector__input" type="number" name="quantity"
          data-quantity-input
          min="0"
          ${
            typeof item.properties?._inventory_quantity !== 'undefined' && item.properties?._inventory_quantity !== null
              ? `max="${parseInt(item.properties._inventory_quantity, 10)}"`
              : ''
          }
          value="${item.quantity}"
          aria-label="${item.title.replace(/"/g, '&quot;')} Quantity Input"
        >

        <button class="quantity-selector__btn " type="button"
          data-quantity-button
          data-action="plus"
          aria-label="Plus ${item.title.replace(/"/g, '&quot;')} Quantity"
        >${window.theme.icons.qtyPlus}</button>
      </div>

      <span class="quantity-selector-notice hide"
        data-quantity-limit-notice
        data-text="${window.theme.strings.productLimitReached}"
      >${window.theme.strings.productLimitReached}</span>
    </quantity-selector>
  `;
