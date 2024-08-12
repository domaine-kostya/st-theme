// Import CSS
import '@/styles/sections/addresses.scss';

import { CountryProvinceSelector } from '@shopify/theme-addresses';

/* Snippets */
import '@/scripts/snippets/custom-dropdown';
import '@/scripts/snippets/modal';

class Addresses extends HTMLElement {
  constructor() {
    super();

    this.addressToggles();
    this.accountPageSelectorInit();
    this.editAddresses();
    this.submitDefaultCheckboxForm();

    const addresses = this.querySelectorAll('[data-address]');

    if (!addresses.length) return;

    const countryProvinceSelector = new CountryProvinceSelector(window.theme.allCountryOptionTags);

    addresses.forEach((address) => {
      this.initializeAddressForm(countryProvinceSelector, address);
    });
  }

  initializeAddressForm(countryProvinceSelector, container) {
    const countrySelector = container.querySelector('[data-address-country]');
    const provinceSelector = container.querySelector('[data-address-province]');
    const provinceWrapper = container.querySelector('[data-address-province-wrapper]');
    const deleteForm = container.querySelector('[data-address-delete-form]');

    if (!countrySelector || !provinceSelector || !provinceWrapper) {
      return;
    }
    countryProvinceSelector.build(countrySelector, provinceSelector, {
      onCountryChange: (provinces) => {
        provinceWrapper.classList.toggle('hide', !provinces.length);
        provinceSelector.dispatchEvent(new Event('change'));
      },
    });

    if (typeof countrySelector.options[countrySelector.selectedIndex] !== 'undefined') {
      countrySelector.dispatchEvent(new Event('change'));
    } else {
      countrySelector.value = 'United States';

      countrySelector.dispatchEvent(new Event('change'));
    }

    if (deleteForm) {
      deleteForm.addEventListener('submit', (event) => {
        const confirmMessage = deleteForm.getAttribute('data-confirm-message');
        if (!window.confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
          event.preventDefault();
        }
      });
    }
  }

  addressToggles() {
    const addressContainer = this.querySelector('[data-account-dashboard-addresses]');

    if (addressContainer === null) return;

    const addresses = addressContainer.querySelectorAll('[data-address-container]');

    addresses.forEach((address) => {
      const toggle = address.querySelector('[data-address-container-toggle]');
      toggle.addEventListener('click', () => {
        address.classList.toggle('active');
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

  editAddresses() {
    const addressContainer = this.querySelector('[data-account-dashboard-addresses]');
    const editButtons = this.querySelectorAll('[data-edit-address-toggle]');
    const editAddressForms = this.querySelectorAll('[data-address]');
    const cancelButtons = this.querySelectorAll('[data-edit-address-cancel]');

    if (!editButtons.length) {
      return;
    }

    editButtons.forEach((editButton) => {
      editButton.addEventListener('click', () => {
        const formId = editButton.getAttribute('data-edit-address-toggle');
        addressContainer.classList.add('hide');

        editAddressForms.forEach((editAddressForm) => {
          if (editAddressForm.getAttribute('data-address') === formId) {
            editAddressForm.classList.remove('hide');
          } else {
            editAddressForm.classList.add('hide');
          }
        });
      });

      cancelButtons.forEach((cancelButton) => {
        cancelButton.addEventListener('click', () => {
          addressContainer.classList.remove('hide');

          editAddressForms.forEach((editAddressForm) => {
            editAddressForm.classList.add('hide');
          });
        });
      });
    });
  }

  submitDefaultCheckboxForm() {
    const defaultCheckboxButtons = this.querySelectorAll('[data-default-checkbox-button]');

    if (!defaultCheckboxButtons.length) {
      return;
    }

    defaultCheckboxButtons.forEach((defaultCheckboxButton) => {
      defaultCheckboxButton.addEventListener('click', () => {
        if (defaultCheckboxButton.classList.contains('active')) {
          return;
        }

        const formId = defaultCheckboxButton.getAttribute('data-default-checkbox-button');

        const matchingForm = this.querySelector(`[data-address="${formId}"]`);

        if (!matchingForm) {
          return;
        }

        matchingForm.querySelector('input[name="address[default]"]').checked = true;

        matchingForm.querySelector('button[type="submit"]').click();
      });
    });
  }
}

customElements.get('section-addresses') || customElements.define('section-addresses', Addresses);
