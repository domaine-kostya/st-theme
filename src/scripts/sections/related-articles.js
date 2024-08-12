import '@/styles/sections/related-articles.scss';
import 'swiper/css/swiper.min.css';

import Swiper from 'swiper';
import { isScriptLoaded, markScriptLoaded } from '@/scripts/core/loaded';

const SECTION_NAME = 'related-articles';

const relatedArticlesInit = () => {
  const featuredArticlesCarousels = document.querySelectorAll('[data-related-articles-carousel]');

  if (!featuredArticlesCarousels.length) {
    return;
  }

  featuredArticlesCarousels.forEach((carousel) => {
    const scrollbar = carousel.querySelector('[data-related-articles-scrollbar]');

    const swiper = new Swiper(carousel, {
      spaceBetween: 16,
      slidesPerView: 'auto',
      freeMode: true,
      draggable: true,
      breakpoints: {
        1025: {
          spaceBetween: 24,
          allowTouchMove: false,
        },
      },
      scrollbar: {
        el: scrollbar,
        draggable: true,
      },
    });

    return swiper;
  });
};

const run = () => {
  relatedArticlesInit();
};

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('shopify:section:load', run);

  markScriptLoaded(SECTION_NAME);
}
