import 'swiper/css/swiper.min.css';

import Swiper from 'swiper';

function storeLocatorInit() {
  const storeLocatorContainer = document.querySelector('#col-main');
  const searchFilters = document.querySelectorAll('.search_filter');
  const searchFiltersWrapper = document.querySelector('.search_filters');
  const searchBarWrapper = document.querySelector('.search_bar');
  const hero = document.querySelector('[data-hero]');
  const stores = document.querySelector('[data-stores]');
  const storesCarousel = document.querySelector('[data-stores-carousel]');

  if (!storeLocatorContainer) {
    return;
  }

  const wrapper = document.createElement('div');

  wrapper.classList.add('store-locator');

  storeLocatorContainer.parentNode.insertBefore(wrapper, storeLocatorContainer);

  wrapper.appendChild(storeLocatorContainer);

  storeLocatorContainer.classList.add('container');

  if (searchFilters.length) {
    const categories = document.createElement('div');
    const types = document.createElement('div');

    categories.classList.add('filter-group', 'filter-group--categories');
    types.classList.add('filter-group', 'filter-group--types');

    categories.innerHTML = `<strong>${window.theme.strings.filterByCategory}</strong>`;
    types.innerHTML = `<strong>${window.theme.strings.filterByStoreType}</strong>`;

    searchFilters.forEach((searchFilter) => {
      const label = searchFilter.querySelector('label');

      if (label && label.innerHTML.indexOf('Category') >= 0) {
        categories.appendChild(searchFilter);
      } else {
        types.appendChild(searchFilter);
      }
    });

    searchFiltersWrapper.appendChild(categories);
    searchFiltersWrapper.appendChild(types);

    searchFilters.forEach((searchFilter) => {
      const label = searchFilter.querySelector('label');
      const checkmark = document.createElement('span');

      checkmark.classList.add('checkmark');

      searchFilter.classList.add('checkbox');
      searchFilter.appendChild(checkmark);

      label.innerHTML = label.innerHTML.split('::')[1];

      let pinColor = null;

      if (label.innerHTML.indexOf('Southern Tide Stores') >= 0) {
        pinColor = '#1C59A8';
      } else if (label.innerHTML.indexOf('Signature Stores') >= 0) {
        pinColor = '#FF8671';
      } else {
        pinColor = '#6A635D';
      }

      if (
        label.innerHTML.indexOf('Department Stores') >= 0 ||
        label.innerHTML.indexOf('Signature Stores') >= 0 ||
        label.innerHTML.indexOf('Specialty Stores') >= 0 ||
        label.innerHTML.indexOf('Southern Tide Stores') >= 0
      ) {
        label.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.0843 2C9.35161 2 4 7.35161 4 14.0843C4 17.3643 5.20843 20.4717 7.62529 22.7159C7.79792 22.8885 14.7032 29.1033 14.8759 29.276C15.5664 29.7939 16.6022 29.7939 17.1201 29.276C17.2927 29.1033 24.3707 22.8885 24.3707 22.7159C26.7875 20.4717 27.9959 17.3643 27.9959 14.0843C28.1686 7.35161 22.817 2 16.0843 2Z" fill="${pinColor}"/>
            <path d="M21.9242 11.4964C21.3315 10.9954 20.6764 10.6197 19.9276 10.3693H19.8964H19.8652C19.7405 9.96229 19.5533 9.49267 19.3661 9.14829C19.1789 8.83522 18.9605 8.55345 18.7422 8.30299C18.6486 8.20906 18.555 8.11514 18.4302 8.02122C18.3678 7.9586 18.2742 7.89599 18.2118 7.86468C18.1494 7.83337 18.087 7.83337 17.9934 7.83337C17.931 7.83337 17.8998 7.83337 17.8686 7.86468L17.7751 7.9586C17.7439 8.05253 17.7127 8.14645 17.7127 8.24037C17.7127 8.39691 17.7439 8.55345 17.7439 8.74129C17.7439 8.92914 17.7127 9.11698 17.6503 9.27352C17.5879 9.39875 17.4631 9.52398 17.3695 9.64921C17.1823 9.80575 16.9327 9.93098 16.7144 9.9936C16.6208 10.0249 16.4648 10.0249 16.3712 10.0562C16.2464 10.0875 16.0904 10.0562 15.9032 10.1188C15.8721 10.1188 15.8409 10.1501 15.8409 10.1814C15.8097 10.2127 15.8097 10.2441 15.8097 10.2754V10.3067C15.6225 10.338 15.5601 10.3693 15.4353 10.4006L15.3729 10.4319L15.3105 10.3693C15.1545 10.0562 14.905 9.83706 14.593 9.64921C14.3122 9.46137 13.969 9.36744 13.6259 9.36744C13.5635 9.36744 13.5011 9.36744 13.4075 9.39875C13.3763 9.39875 13.3763 9.39875 13.3451 9.43006H13.3139C13.3139 9.43006 13.2827 9.43006 13.2827 9.46137V9.52398L13.3139 9.55529C14.0938 10.0562 14.281 10.4319 14.281 10.6197C14.281 10.6824 14.2498 10.7137 14.2498 10.7763H14.2186C14.125 10.8076 14.0314 10.8076 13.9379 10.8076H13.7195C13.6883 10.8076 13.6883 10.8076 13.6571 10.8389C13.6259 10.8702 13.5947 10.9015 13.5947 10.9328C13.5635 10.9954 13.5323 11.0894 13.5011 11.152C13.4699 11.2146 13.4387 11.2459 13.4075 11.2772C13.4075 11.3085 13.3763 11.3085 13.3763 11.3398C13.3451 11.3711 13.3139 11.3711 13.2827 11.3711H13.1267C13.0019 11.3711 12.846 11.3398 12.7524 11.3398H12.69C12.69 11.3398 12.6588 11.3398 12.6588 11.3711L12.6276 11.4024V11.4337C12.5964 11.5277 12.5964 11.6216 12.5652 11.7155C12.534 11.8407 12.4716 11.9347 12.378 11.9973C12.2844 12.0286 12.1596 12.0599 12.0348 12.0599H11.7229C11.7229 12.0599 11.6917 12.0599 11.6917 12.0912C11.6917 12.1225 11.6605 12.1225 11.6605 12.1538C11.6293 12.2164 11.6293 12.3104 11.5981 12.4043C11.5981 12.4356 11.5669 12.4982 11.5669 12.5295C11.5669 12.5608 11.5357 12.5608 11.5357 12.5921C11.4109 12.7174 11.3485 12.7487 11.3173 12.78C11.3173 12.279 10.9742 11.5903 10.5374 10.9328C10.0694 10.3067 9.44551 9.71183 8.85277 9.52398C8.79038 9.43006 8.69679 9.43006 8.63439 9.43006C8.6032 9.43006 8.572 9.43006 8.5408 9.46137C8.50961 9.46137 8.50961 9.49267 8.50961 9.49267C8.50961 9.52398 8.47841 9.52398 8.47841 9.55529C8.47841 9.6179 8.5408 9.71183 8.6032 9.74313C8.75918 9.89967 8.94636 10.1188 9.07115 10.3067C9.44551 10.9328 9.66389 11.5277 9.75748 12.7487C9.75748 12.9991 9.78868 13.2183 9.85107 13.4687C9.91346 13.594 9.97586 13.7192 10.0071 13.8131C10.0382 13.8757 10.0694 13.9383 10.0694 14.001C10.0071 14.1575 9.88227 14.3453 9.85107 14.6271C9.85107 14.9402 9.81987 15.2533 9.72628 15.5663C9.47671 16.5369 9.03995 17.4448 8.41602 18.1962C8.44721 18.2275 8.44721 18.2588 8.44721 18.2901C8.44721 18.3214 8.44721 18.3214 8.47841 18.3527C8.47841 18.3527 8.50961 18.384 8.5408 18.384H8.572C8.63439 18.384 8.69679 18.384 8.75918 18.3527L8.88397 18.3214C9.44551 18.2275 9.94466 17.9144 10.2878 17.4448C10.5998 17.0065 10.8182 16.4743 11.0365 15.9107C11.0989 15.7542 11.1613 15.4411 11.2237 15.2846C11.2237 15.2846 11.2549 15.2533 11.2861 15.2533C11.2861 15.2533 11.3173 15.2533 11.3173 15.2846L11.3797 15.3472C11.4421 15.4724 11.4733 15.5976 11.4421 15.7229V15.9107H11.5045C11.6605 15.9107 11.7853 15.8794 11.8789 15.8794C11.9413 15.8794 12.0348 15.8794 12.0972 15.9107C12.0972 15.942 12.1284 15.942 12.1284 15.9733C12.1596 16.0986 12.1908 16.2238 12.1908 16.349V16.4116H12.2532C12.4092 16.3803 12.5652 16.3177 12.69 16.3177C12.7524 16.3177 12.8148 16.349 12.8772 16.3803C12.9396 16.4116 12.9707 16.4743 12.9707 16.5056C13.0019 16.5995 13.0331 16.6621 13.0643 16.756C13.0643 16.756 13.0643 16.8186 13.0955 16.8186C13.1267 16.8186 13.1267 16.7873 13.1579 16.7873C13.2203 16.756 13.3139 16.7247 13.4075 16.7247C13.4699 16.7247 13.5011 16.7247 13.5635 16.756H13.5947C13.6259 16.7873 13.6259 16.8186 13.6571 16.8499C13.6571 16.9126 13.6259 16.9752 13.5947 17.0378C13.4075 17.4761 12.8772 18.1336 12.4404 18.384V18.4779L12.4716 18.5092C12.534 18.5406 12.5964 18.5406 12.6588 18.5406H12.9084C13.6883 18.4153 14.4682 17.8831 15.0297 17.2256C15.9344 17.4761 16.7768 17.5387 17.6815 17.6639C17.6815 17.6953 17.7127 17.7266 17.7127 17.7579C17.7127 17.9457 17.5567 18.1962 17.3695 18.4153C17.2135 18.6032 17.0263 18.791 16.808 18.9476C16.7768 18.9789 16.7456 19.0102 16.7456 19.0415V19.1041L16.7768 19.1354C16.808 19.1667 16.8392 19.1667 16.9015 19.1667H17.3071C17.5255 19.1354 17.7439 19.0728 17.931 18.9476C18.2742 18.7597 18.555 18.5092 18.7734 18.1649C18.8669 17.977 18.9605 17.7892 19.0229 17.6013C19.9276 17.4761 20.8011 17.1943 21.5187 16.756C22.2986 16.2551 22.8601 15.5037 23.0473 14.5958V14.5645L23.0161 14.5332C22.8601 14.4393 22.7042 14.3453 22.5794 14.2514C22.5482 14.2201 22.4858 14.1888 22.4546 14.1262C22.6106 13.9697 22.8289 13.8444 23.0473 13.7818H23.0785V13.7505C23.0473 12.7487 22.5482 12.0286 21.9242 11.4964Z" fill="white"/>
          </svg>

          <span>${label.innerHTML}</span>
        `;
      }
    });
  }

  const searchMessage = document.createElement('div');

  searchMessage.classList.add('search-message');

  searchMessage.innerHTML = window.theme.strings.searchMessage;

  searchBarWrapper.appendChild(searchMessage);

  const storeLocatorWrapper = document.querySelector('.store-locator');

  if (hero && storeLocatorWrapper) {
    storeLocatorWrapper.parentNode.insertBefore(hero, storeLocatorWrapper);
  }

  if (stores && storeLocatorWrapper) {
    storeLocatorWrapper.parentNode.insertBefore(stores, storeLocatorWrapper);
  }

  if (storesCarousel) {
    const prev = storesCarousel.closest('[data-stores]').querySelector('[data-stores-carousel-prev]');
    const next = storesCarousel.closest('[data-stores]').querySelector('[data-stores-carousel-next]');

    const swiper = new Swiper(storesCarousel, {
      spaceBetween: 16,
      slidesPerView: 'auto',
      freeMode: false,
      draggable: true,
      breakpoints: {
        1025: {
          spaceBetween: 24,
          slidesPerView: 3,
        },
      },
      navigation: {
        prevEl: prev,
        nextEl: next,
      },
    });

    return swiper;
  }
}

window.addEventListener('load', () => {
  storeLocatorInit();
});
