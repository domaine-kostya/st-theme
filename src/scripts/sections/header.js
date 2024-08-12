function headerInit() {
  const siteHeaderWrapper = document.querySelector('[data-site-header-wrapper]');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const isScrollingDown = scrollPosition > lastScrollTop;

    siteHeaderWrapper.classList.toggle('site-header-wrapper--compact', isScrollingDown);
    lastScrollTop = Math.max(0, scrollPosition);
  });
}

window.addEventListener('cartUpdate', ({ detail: { cartData } }) => {
  const cartIcon = document.querySelector('[data-site-header-cart-icon]');

  if (!cartIcon) {
    return;
  }

  if (cartData.item_count >= 1) {
    cartIcon.classList.add('active');
  } else {
    cartIcon.classList.remove('active');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  headerInit();
});
