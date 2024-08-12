import '@/styles/sections/cart.scss';

// Hide shipping calculator if the countries script is unavailable.
if (typeof window.Countries === 'undefined') {
  const estimationToggle = document.querySelector('.cart__shipping-estimate-toggle');
  estimationToggle && (estimationToggle.style.display = 'none');
}