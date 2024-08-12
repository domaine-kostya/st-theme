import '@/styles/sections/page.scss';

function pageInit() {
  const anchorLinks = document.querySelectorAll('.privacy-policy-anchor');
  let headerHeight;
  if (window.innerWidth < 750) {
    headerHeight = '110px';
  }
  if (window.innerWidth > 750 && window.innerWidth < 1024) {
    headerHeight = '100px';
  }
  if (window.innerWidth > 1024 && window.innerWidth < 1200) {
    headerHeight = '167px';
  }
  if (window.innerWidth > 1200) {
    headerHeight = '176px';
  }
  anchorLinks.forEach((el) => {
    el.addEventListener('click', (event) => {
      const anchorEl = document.getElementById(`${event.target.href.split('#')[1]}`);
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;

      const isScrollingDown = scrollPosition < anchorEl.offsetTop;
      if (isScrollingDown) {
        if (window.innerWidth > 1024) {
          anchorEl.style.scrollMarginBlock = '70px';
        } else {
          anchorEl.style.scrollMarginBlock = headerHeight;
        }
      }
      if (!isScrollingDown) {
        anchorEl.style.scrollMarginBlock = headerHeight;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  pageInit();
});
