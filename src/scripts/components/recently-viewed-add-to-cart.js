const ADD_TO_CART_BTN_SELECTOR = 'button.ls-quick-view-body__add-to-cart, .ls-quick-view-body__add-to-cart button';

const getAddToCartBtnFromAddedNodes = (addedNodes) => {
  const nodes = [...addedNodes];
  let addToCartBtn = null;

  nodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches(ADD_TO_CART_BTN_SELECTOR)) {
      addToCartBtn = node;
    } else {
      addToCartBtn = node.querySelector(ADD_TO_CART_BTN_SELECTOR);
    }
  });

  return addToCartBtn;
};

const copyAddToCartBtn = (addToCartBtn) => {
  const addToCartBtnCopy = addToCartBtn.cloneNode(true);
  addToCartBtn.parentNode.insertBefore(addToCartBtnCopy, addToCartBtn);

  addToCartBtn.remove();
  return addToCartBtnCopy;
};

const getActiveOptions = () =>
  [...document.querySelectorAll('.ls-quick-view-body__option--selected')].map((option) => option.innerText);

const getActiveVariant = (product) => {
  const activeOptions = getActiveOptions();

  const activeVariant = product.variants.find((variant) => {
    const variantOptions = variant.options.map((option) => option.toLowerCase());
    return activeOptions.every((option) => variantOptions.includes(option.toLowerCase()));
  });

  return activeVariant;
};

const handleMutations = (mutation, observer) => {
  const addToCartBtn = getAddToCartBtnFromAddedNodes(mutation.addedNodes);
  if (!addToCartBtn) return;
  observer.disconnect();

  const addToCartBtnCopy = copyAddToCartBtn(addToCartBtn);

  addToCartBtnCopy.addEventListener(
    'click',
    async () => {
      const productLink = document.querySelector('a.ls-quick-view-body__product-link').href.split('?')[0];

      const response = await fetch(`${productLink}.js`);
      const product = await response.json();

      const activeVariant = getActiveVariant(product);

      const itemToAdd = {
        items: [
          {
            quantity: 1,
            id: activeVariant.id,
          },
        ],
      };

      await window.cartAPI.cartAdd(itemToAdd, true);
      document.querySelector('.ls-dialog__close-button')?.click();
    },
    { once: true },
  );
};

const onDOMMutation = (mutations, observer) => {
  mutations.forEach((mutation) => handleMutations(mutation, observer));
};

const obeserver = new MutationObserver(onDOMMutation);
document.addEventListener('click', (e) => {
  if (e.target.matches('button.ls-button.ls-select-button.ls-add-to-cart')) {
    obeserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: false,
    });
    handleMutations({ addedNodes: [document.body] }, obeserver);
  }
});
