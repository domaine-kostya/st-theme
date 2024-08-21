function productBundleFormInit() {
  const productBundleSubmit = document.querySelector('[data-product-bundle-submit]');

  if (!productBundleSubmit) {
    return;
  }

  productBundleSubmit.addEventListener('click', () => {
    const parentBundle = document.querySelector('[data-bundle]');
    const bundleProducts = document.querySelectorAll('[data-bundle-product]');

    if (!bundleProducts.length) {
      return;
    }

    const lineItems = {
      items: [],
    };

    const bundleId = `bundle_${new Date().getTime()}`;

    bundleProducts.forEach((bundleProduct, index) => {
      const variantId = bundleProduct.querySelector('[data-product-select]').value;
      const hideItemInCart = index !== bundleProducts.length - 1;
      const timestamp = Date.now();

      if (index === 0) {
        const bundleChildrenIds = [];
        const bundleChildrenTitles = [];

        bundleProducts.forEach((bundleProduct) => {
          const select = bundleProduct.querySelector('[data-product-select]');
          const variantTitle = select.options[select.selectedIndex].text.split(' - ')[0];
          const productTitle = bundleProduct.querySelector('[data-bundle-product-title]').innerHTML;

          bundleChildrenIds.push(bundleProduct.querySelector('[data-product-select]').value);
          bundleChildrenTitles.push(`${productTitle} - ${variantTitle}`);
        });

        lineItems.items.push({
          id: variantId,
          quantity: 1,
          properties: {
            _parent_bundle_product: bundleId,
            _parent_bundle_children: bundleChildrenIds.toString(),
            _parent_bundle_children_titles: bundleChildrenTitles.toString(),
            _bundle_cart_hide: hideItemInCart,
            _bundle_title: parentBundle.getAttribute('data-bundle-title'),
            _bundle_image: parentBundle.getAttribute('data-bundle-image'),
            _bundle_handle: parentBundle.getAttribute('data-bundle-handle'),
            _bundle_total_price: parentBundle.getAttribute('data-bundle-price'),
            _bundle_item: true,
            _bundle_id: `${parentBundle.getAttribute('data-bundle-sku')}_${timestamp}`,
          },
        });
      } else {
        lineItems.items.push({
          id: variantId,
          quantity: 1,
          properties: {
            _child_bundle_product: bundleId,
            _bundle_cart_hide: hideItemInCart,
            _bundle_title: parentBundle.getAttribute('data-bundle-title'),
            _bundle_image: parentBundle.getAttribute('data-bundle-image'),
            _bundle_handle: parentBundle.getAttribute('data-bundle-handle'),
            _bundle_total_price: parentBundle.getAttribute('data-bundle-price'),
            _bundle_item: true,
            _bundle_id: `${parentBundle.getAttribute('data-bundle-sku')}_${timestamp}`,
          },
        });
      }
    });

    window.cartAPI.cartAdd(lineItems, true);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  productBundleFormInit();
});

document.addEventListener('shopify:section:load', () => {
  productBundleFormInit();
});
