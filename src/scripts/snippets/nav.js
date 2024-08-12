import { trapFocus, removeTrapFocus } from '@shopify/theme-a11y';

function navInit() {
  const siteHtml = document.querySelector('[data-site-html]');
  const siteBody = document.querySelector('[data-site-body]');
  const siteHeaderWrapper = document.querySelector('[data-site-header-wrapper]');
  const nav = document.querySelector('[data-nav]');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const navSearch = document.querySelector('[data-nav-search]');
  const navSearchToggle = document.querySelector('[data-nav-search-toggle]');
  const searchBar = document.querySelector('[data-search-bar]');
  const navCartToggle = document.querySelector('[data-nav-cart-toggle]');
  const mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
  const mobileNavClose = document.querySelector('[data-mobile-nav-close]');
  const mobileLinks = document.querySelectorAll('[data-mobile-link]');
  const mobileSublinks = document.querySelectorAll('[data-mobile-sublink]');
  const cartPreview = document.querySelector('[data-cart-preview]');
  const cartPreviewOverlay = document.querySelector('[data-cart-preview-overlay]');

  let navSearchIsOpen = false;

  const toggleNavSearch = (active = undefined) => {
    navSearchToggle?.classList.toggle('active', active);
    navSearch?.classList.toggle('active', active);

    navSearchIsOpen = navSearch && navSearch.classList.contains('active');

    siteBody.classList.toggle('disable-scrolling', navSearchIsOpen);
    siteBody.classList.toggle('nav-active', active);
    siteHtml.classList.toggle('nav-active', active);
    siteBody.classList.toggle('search-active', active);
    siteHtml.classList.toggle('search-active', active);
  };

  mobileLinks.forEach((mobileLink) => {
    mobileLink.addEventListener('click', () => {
      mobileLink.closest('[data-mobile-link-wrapper]').classList.toggle('active');
    });
  });

  mobileSublinks.forEach((mobileSublink) => {
    mobileSublink.addEventListener('click', () => {
      mobileSublink.classList.toggle('active');
      mobileSublink
        .closest('[data-mobile-sublink-wrapper]')
        .querySelector('[data-mobile-sub-sublinks]')
        .classList.toggle('active');
    });
  });

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNavToggle.classList.toggle('active');
      siteHtml.classList.remove('search-active');
      toggleNavSearch(false);

      if (mobileNavToggle.classList.contains('active')) {
        siteHtml.classList.add('nav-active');
        siteBody.classList.add('nav-active');
        nav.classList.remove('d-none');
        trapFocus(nav);
      } else {
        siteHtml.classList.remove('nav-active');
        siteBody.classList.remove('nav-active');
        nav.classList.add('d-none');
        removeTrapFocus();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => {
      mobileNavToggle.classList.remove('active');
      siteHtml.classList.remove('nav-active', 'search-active');
      siteBody.classList.remove('nav-active');
      nav.classList.add('d-none');
      removeTrapFocus();
    });
  }

  if (navSearchToggle && searchBar) {
    navSearchToggle.addEventListener('click', () => {
      if (window.innerWidth >= 768) {
        mobileNavToggle.classList.remove('active');
        toggleNavSearch();

        if (navSearchToggle.classList.contains('active')) {
          siteHtml.classList.add('nav-active', 'search-active');
          siteBody.classList.add('nav-active');
          nav.classList.remove('d-none');
          siteHeaderWrapper.classList.remove('site-header-wrapper--compact');
        } else {
          siteHtml.classList.remove('nav-active', 'search-active');
          siteBody.classList.remove('nav-active');
          nav.classList.add('d-none');
        }

        if (navSearchToggle.classList.contains('active')) {
          searchBar.focus();
        }
      } else {
        const mobileHiddenSearchWrapper = document.querySelector('[data-mobile-hidden-search]');
        const mobileHiddenSearchInput = mobileHiddenSearchWrapper.querySelector('input[type="search"]');

        mobileHiddenSearchWrapper.classList.remove('d-none');
        mobileHiddenSearchInput.focus();

        setTimeout(() => {
          mobileHiddenSearchWrapper.classList.add('d-none');
        }, 1000);
      }
    });
  }

  if (navCartToggle) {
    if (navCartToggle.getAttribute('data-nav-cart-toggle') === 'true') {
      navCartToggle.addEventListener('mouseover', () => {
        if (
          window.innerWidth < 1025 ||
          document.body.classList.contains('template-cart') ||
          !cartPreview.classList.contains('d-none')
        ) {
          return;
        }
        openCartPreview();
      });
    }

    navCartToggle.addEventListener('click', () => {
      siteHtml.classList.add('disable-scrolling');
      siteBody.classList.add('disable-scrolling');
      openCartPreview();
    });
  }

  function openCartPreview() {
    cartPreview.classList.toggle('d-none');
    cartPreviewOverlay.classList.toggle('d-none');

    if (cartPreview.classList.contains('d-none')) {
      removeTrapFocus();
    } else {
      trapFocus(cartPreview);
    }
  }

  if (navLinks) {
    navLinks.forEach((navLink) => {
      navLink.addEventListener('click', (event) => {
        if (navSearchIsOpen) {
          event.preventDefault();
          toggleNavSearch(false);
          navLink.blur();
        }
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    toggleNavSearch(false);
  });

  setMobileNavHeight();
  window.addEventListener('resize', () => setTimeout(() => setMobileNavHeight(), 200));

  function setMobileNavHeight() {
    document.documentElement.style.setProperty('--header-height', `${siteHeaderWrapper.offsetHeight}px`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  navInit();
});

document.addEventListener('shopify:section:load', () => {
  navInit();
});
