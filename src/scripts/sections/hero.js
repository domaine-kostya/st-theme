import '@/styles/sections/hero.scss';
import 'swiper/css/swiper.min.css';

import Swiper from 'swiper';
import { isScriptLoaded, markScriptLoaded } from '@/scripts/core/loaded';

const SECTION_NAME = 'hero';

const heroInit = () => {
  const heroSliders = document.querySelectorAll('[data-hero-slider]');
  const heroCtas = document.querySelectorAll('[data-hero-anchor-cta]');

  if (heroCtas) {
    heroCtas.forEach((heroCta) => {
      heroCta.addEventListener('click', () => {
        const targetId = heroCta.getAttribute('data-hero-anchor-cta');

        const targetElement = document.querySelector(`#${targetId}`);

        window.scrollTo({
          top: targetElement.offsetTop - 170,
          left: 0,
          behavior: 'smooth',
        });
      });
    });
  }

  if (heroSliders) {
    heroSliders.forEach((heroSlider) => {
      const heroPagination = heroSlider.querySelector('[data-hero-pagination]');

      const swiper = new Swiper(heroSlider, {
        loop: true,
        autoHeight: true,
        effect: 'fade',
        speed: 0,
        autoplay: {
          delay: 8000,
        },
        breakpoints: {
          1025: {
            speed: 300,
          },
        },
        fadeEffect: {
          crossFade: true,
        },
        pagination: {
          el: heroPagination,
          clickable: true,
          type: 'bullets',
        },
      });

      return swiper;
    });
  }
};

const run = () => {
  heroInit();
};

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('shopify:section:load', run);

  markScriptLoaded(SECTION_NAME);
}
