// Import CSS
import '@/styles/sections/account.scss';

/* Snippets */
import '@/scripts/snippets/custom-dropdown';

class Account extends HTMLElement {
  constructor() {
    super();

    this.orderDetails();
    this.accountPageSelectorInit();
  }

  orderDetails() {
    const ordersContainer = this.querySelector('[data-account-dashboard-orders]');

    if (ordersContainer === null) return;

    const orders = ordersContainer.querySelectorAll('[data-account-dashboard-order]');

    orders.forEach((order) => {
      const toggle = order.querySelector('[data-account-dashboard-order-toggle]');
      toggle.addEventListener('click', () => {
        order.classList.toggle('active');
      });
    });
  }

  accountPageSelectorInit() {
    const pageSelector = this.querySelector('[data-account-page-selector]');

    if (pageSelector === null) return;

    pageSelector.addEventListener('change', () => {
      window.location.href = pageSelector.value;
    });
  }
}

customElements.get('section-account') || customElements.define('section-account', Account);
