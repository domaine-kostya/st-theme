import 'swiper/css/swiper.min.css';
import '@/styles/sections/featured-articles.scss';

import Swiper from 'swiper';
import { isScriptLoaded, markScriptLoaded } from '@/scripts/core/loaded';

const SECTION_NAME = 'featured-articles';

const featuredArticlesInit = () => {
  const featuredArticlesCarousels = document.querySelectorAll('[data-featured-articles-carousel]');

  if (!featuredArticlesCarousels.length) {
    return;
  }

  featuredArticlesCarousels.forEach((carousel) => {
    const scrollbar = carousel.querySelector('[data-featured-articles-scrollbar]');

    const swiper = new Swiper(carousel, {
      spaceBetween: 16,
      slidesPerView: 'auto',
      freeMode: true,
      draggable: true,
      breakpoints: {
        1025: {
          spaceBetween: 24,
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
  featuredArticlesInit();
};

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('shopify:section:load', run);

  markScriptLoaded(SECTION_NAME);
}
