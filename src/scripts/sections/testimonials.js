import 'swiper/css/swiper.min.css';
import '@/styles/sections/testimonials.scss';

import Swiper from 'swiper';

class Testimonials extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const carousel = this.querySelector('[data-testimonials-carousel]');
    const pagination = this.querySelector('[data-testimonials-pagination]');
    const scrollbar = this.querySelector('[data-testimonials-scrollbar]');
    const prev = this.querySelector('[data-testimonials-prev]');
    const next = this.querySelector('[data-testimonials-next]');

    const swiper = new Swiper(carousel, {
      spaceBetween: 24,
      slidesPerView: 'auto',
      freeMode: true,
      draggable: true,
      breakpoints: {
        1025: {
          spaceBetween: 24,
          slidesPerView: 3,
          slidesPerGroup: 2,
        },
      },
      navigation: {
        prevEl: prev,
        nextEl: next,
      },
      scrollbar: {
        el: scrollbar,
        draggable: true,
      },
      pagination: {
        el: pagination,
        clickable: true,
        type: 'bullets',
      },
    });

    return swiper;
  }
}

customElements.get('section-testimonials') || customElements.define('section-testimonials', Testimonials);
