import '@/styles/sections/newsletter-popup.scss';

import { trapFocus, removeTrapFocus } from '@/scripts/core/a11y';
import Cookies from 'js-cookie';
import { scrollLockOpen, scrollLockClose } from '@/scripts/core/scroll-lock';

import { isScriptLoaded, markScriptLoaded } from '@/scripts/core/loaded';

const SECTION_NAME = 'newsletter-popup';

const newsletterPopupInit = () => {
  const newsletterPopup = document.querySelector('[data-newsletter-popup]');
  const newsletterPopupCookie = Cookies.get('newsletter-popup');
  const newsletterPopupClose = document.querySelector('[data-newsletter-popup-close]');

  if (!newsletterPopup || newsletterPopupCookie === 'true') {
    return;
  }

  newsletterPopup.classList.remove('hide');

  scrollLockOpen();

  trapFocus(newsletterPopup);

  newsletterPopupClose.addEventListener('click', () => {
    newsletterPopup.classList.add('hide');

    scrollLockClose();

    removeTrapFocus();

    Cookies.set('newsletter-popup', true);
  });
};

const run = () => {
  newsletterPopupInit();
};

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('shopify:section:load', run);

  markScriptLoaded(SECTION_NAME);
}
