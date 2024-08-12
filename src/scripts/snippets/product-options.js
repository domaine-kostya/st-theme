export function productOptionsInit() {
  const productParentEls = document.querySelectorAll('[data-product]');
  const bundleSubmit = document.querySelector('[data-product-bundle-submit]');
  const addOnSubmit = document.querySelector('[data-add-on-submit]');

  if (!productParentEls.length) return;

  let inventoryData = [];

  async function fetchInventory(productId) {
    const response = await fetch(`https://chubby-cows-melt.loca.lt/api/product/${productId}/inventory`);
    return response.json();
  }

  productParentEls.forEach((productParentEl) => {
    const optionGroups = productParentEl.querySelectorAll('[data-product-option-group]');
    const optionRadios = productParentEl.querySelectorAll('[data-product-option][data-type="radio"]');
    const productJsonEl = productParentEl.querySelector('[data-product-json]');
    const variantJsonEl = productParentEl.querySelector('[data-variant-json]');
    const variantStockMessage = productParentEl.querySelector('[data-variant-stock-message]');
    const quantitySelectInput = productParentEl.querySelector('[data-quantity-input]');
    const productSelect = productParentEl.querySelector('[data-product-select]');
    const finalSaleInput = productParentEl.querySelector('[data-final-sale-input]');
    const submitButton = productParentEl.querySelector('[data-product-submit]');
    const price = productParentEl.querySelector('[data-product-price]');
    const comparePrice = productParentEl.querySelector('[data-product-compare-price]');
    const saleMessage = productParentEl.querySelector('[data-product-sale-message]');
    const saleMessageText = productParentEl.querySelector('[data-product-sale-message-text]');

    if (!optionGroups) {
      return;
    }

    const productJson = JSON.parse(productJsonEl.innerHTML);
    const variantJson = JSON.parse(variantJsonEl.innerHTML);

    console.log(13);

    optionGroups.forEach((optionGroup) => {
      optionGroup.addEventListener('change', (event) => {
        handleOptionChange(optionGroup);
      });
    });

    function handleOptionChange(group) {
      const selectedOptions = getSelectedOptions();
      const selectedVariant = getVariantByOptions(selectedOptions);

      updateOptionRadios(selectedOptions);
      updateSelectedText();
      updateProductGallery(selectedVariant);
      updateBundleImage(selectedVariant, group);
      updateAddOnImage(selectedVariant, group);
      updateVariantStockMessage(selectedVariant);
      updateQuanitySelect(selectedVariant);

      // Set hidden product select value
      if (selectedVariant) {
        productSelect.value = selectedVariant.id;

        const selectedVariantData = variantJson.find((variant) => variant.id === selectedVariant.id);
        if (selectedVariantData && finalSaleInput) {
          finalSaleInput.value = selectedVariantData.final_sale;
        }
      }

      // Disable / Enable update button
      if (submitButton) {
        const inventoryItem = inventoryData.find(item => item.variant_id == selectedVariant.id);
        // submitButton.disabled = inventoryItem ? inventoryItem.purchasable === 0 : true;
      }

      if (price) {
        if (selectedVariant.compare_at_price) {
          price.classList.add('product__price--on-sale');
        } else {
          price.classList.remove('product__price--on-sale');
        }

        price.innerHTML = Shopify.formatMoney(selectedVariant.price, theme.moneyFormat);
      }

      if (comparePrice) {
        if (selectedVariant.compare_at_price) {
          const activeColor = productParentEl.querySelector('.product-option-item--color.active');

          comparePrice.classList.remove('hide');
          comparePrice.innerHTML = Shopify.formatMoney(selectedVariant.compare_at_price, theme.moneyFormat);
          saleMessage.classList.remove('d-none');

          if (activeColor && activeColor.closest('[data-product-option-item-final-sale]')) {
            saleMessageText.innerHTML = window.theme.strings.final_sale;
          } else {
            saleMessageText.innerHTML = window.theme.strings.selected_style_on_sale;
          }
        } else {
          comparePrice.classList.add('hide');
          saleMessage.classList.add('d-none');
        }
      }

      if (bundleSubmit) {
        const productOptionItems = document.querySelectorAll('[data-product-option-item]');

        const inventoryItem = inventoryData.find(item => item.variant_id == selectedVariant.id);
        bundleSubmit.disabled = inventoryItem ? inventoryItem.purchasable === 0 : true;

        if (productOptionItems.length) {
          productOptionItems.forEach((productOptionItem) => {
            if (productOptionItem.classList.contains('active') && productOptionItem.classList.contains('soldout')) {
              bundleSubmit.disabled = true;
            }
          });
        }
      }
    }

    function updateSoldoutStatus() {
      inventoryData.forEach(item => {
        const variantElement = productParentEl.querySelector(`[data-variant-id="${item.variant_id}"]`);
        if (variantElement) {
          if (item.purchasable === 0) {
            variantElement.classList.add('soldout');
          } else {
            variantElement.classList.remove('soldout');
          }
        }
      });
    }

    function getSelectedOptions() {
      const selectedOptions = [...optionGroups].reduce((object, group) => {
        let value = null;
        if (group.dataset.type === 'select') {
          const select = group.querySelector('[data-product-option]');
          value = select.value;
        } else {
          value = group.querySelector('[data-product-option]:checked').value;
          const productOptionItems = group
            .querySelector('[data-product-option]:checked')
            .closest('[data-product-option-group]')
            .querySelectorAll('[data-product-option-item]');
          const currentItem = group
            .querySelector('[data-product-option]:checked')
            .closest('[data-product-option-item]');

          if (productOptionItems.length) {
            productOptionItems.forEach((productOptionItem) => {
              if (productOptionItem === currentItem) {
                productOptionItem.classList.add('active');
              } else {
                productOptionItem.classList.remove('active');
              }
            });
          }
        }

        object[`option${group.dataset.optionIndex}`] = value;
        return object;
      }, {});

      return selectedOptions;
    }

    function updateSelectedText(group, input) {
      optionGroups.forEach((optionGroup) => {
        const selectedInput = optionGroup.querySelector('[data-product-option]:checked');
        const selectedTextEl = optionGroup.querySelector('[data-product-option-group-selected-text]');
        if (!selectedTextEl || !selectedInput) return;

        const { selectedText } = selectedInput.dataset;

        selectedTextEl.textContent = selectedText;
      });
    }

    function updateVariantStockMessage(selectedVariant) {
      if (!variantStockMessage) return;
      variantStockMessage.classList.add('hide');

      if (!selectedVariant) {
        variantStockMessage.classList.remove('hide');
        variantStockMessage.textContent = variantStockMessage.dataset.notAvailableText;
      } else if (selectedVariant.available === false) {
        variantStockMessage.classList.remove('hide');
        variantStockMessage.textContent = variantStockMessage.dataset.noStockText;
      } else if (
        selectedVariant.inventory_policy === 'deny' &&
        selectedVariant.inventory_quantity < parseInt(variantStockMessage.dataset.lowStockBreakpoint, 10)
      ) {
        variantStockMessage.classList.remove('hide');
        variantStockMessage.textContent = variantStockMessage.dataset.lowStockText;
      }
    }

    function updateAddOnImage(selectedVariant, group) {
      if (!addOnSubmit || !group) {
        return;
      }

      const addOnImage = group.closest('[data-product]').querySelector('[data-add-on-image]').querySelector('img');

      addOnImage.removeAttribute('data-srcset');
      addOnImage.removeAttribute('srcset');
      addOnImage.setAttribute('src', selectedVariant.featured_image.src.replace('.jpg', '_250x250.jpg'));
    }

    function updateBundleImage(selectedVariant, group) {
      if (!bundleSubmit || !group) {
        return;
      }

      const bundleImage = group
        .closest('[data-product]')
        .querySelector('[data-bundle-product-image]')
        .querySelector('img');

      bundleImage.removeAttribute('data-srcset');
      bundleImage.removeAttribute('srcset');
      bundleImage.setAttribute('src', selectedVariant.featured_image.src.replace('.jpg', '_250x250.jpg'));
    }

    function updateProductGallery(selectedVariant) {
      const galleryCarousels = productParentEl.querySelectorAll('product-gallery-carousel');

      galleryCarousels.forEach((carousel) => {
        carousel.selectedVariant = selectedVariant;
      });
    }

    function updateQuanitySelect(selectedVariant) {
      if (!quantitySelectInput || !selectedVariant) return;

      if (quantitySelectInput.value > selectedVariant.inventory_quantity && selectedVariant.inventory_quantity > 0) {
        quantitySelectInput.value = selectedVariant.inventory_quantity;
      }

      // eslint-disable-next-line no-nested-ternary
      const maxValue = selectedVariant.inventory_policy === 'continue' ? 99 : selectedVariant.inventory_quantity;

      quantitySelectInput.max = maxValue;
    }

    function updateOptionRadios(selectedOptions) {
      let actSizeSoldOut = false;
      optionRadios.forEach((optionRadio) => {
        const inputOptions = { ...selectedOptions };
        const parentItemEl = optionRadio.closest('[data-product-option-item]');

        inputOptions[`option${optionRadio.dataset.optionIndex}`] = optionRadio.value;

        const matchingVariant = getVariantByOptions(inputOptions);

        if (matchingVariant) {
          parentItemEl.classList.remove('soldout');
          parentItemEl.classList.remove('unavailable');
        } else {
          parentItemEl.classList.add('unavailable');
        }

        if (optionRadio.checked && parentItemEl.classList.contains('soldout')) {
          actSizeSoldOut = true;
        }
      });

      const actColRad = document.querySelector('.product-option-item--color.active');
      const colOptItems = document.querySelectorAll('.product-option-item--color');
      colOptItems.forEach(colorOptionItem => {
        colorOptionItem.classList.remove('soldout');
      });

      if (actColRad) {
        if (actSizeSoldOut) {
          actColRad.classList.add('soldout');
        } else {
          actColRad.classList.remove('soldout');
        }
      }
    }

    function getVariantByOptions(options) {
      return productJson.variants.find(
        (variant) =>
          !Object.entries(options).find((option) => {
            const [key, value] = option;

            return variant[key] !== value;
          }),
      );
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  productOptionsInit();
});
