// Import CSS
import '@/styles/sections/product.scss';

/* Components */
import '@/scripts/components/product-thumbnails';

// Snippets
import '@/scripts/snippets/custom-dropdown';
import '@/scripts/snippets/product-bundle';
import '@/scripts/snippets/product-gallery';

function productInit() {
  const productDetailsShowMoreToggle = document.querySelector('[data-product-info-show-more-toggle]');

  if (!productDetailsShowMoreToggle) {
    return;
  }

  productDetailsShowMoreToggle.addEventListener('click', () => {
    const openText = productDetailsShowMoreToggle.getAttribute('data-open-text');
    const closedText = productDetailsShowMoreToggle.getAttribute('data-closed-text');
    const parentBlock = productDetailsShowMoreToggle.closest('[data-product-description-block]');

    parentBlock.classList.toggle('active');

    if (productDetailsShowMoreToggle.innerHTML === openText) {
      productDetailsShowMoreToggle.innerHTML = closedText;
      productDetailsShowMoreToggle.setAttribute('aria-label', `${closedText} features`);
    } else {
      productDetailsShowMoreToggle.innerHTML = openText;
      productDetailsShowMoreToggle.setAttribute('aria-label', `${openText} features`);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  productInit();
});
