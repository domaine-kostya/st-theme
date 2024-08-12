import '@/styles/sections/blog-filter.scss';

class BlogFilter extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const blogFilterButtons = this.querySelectorAll('[data-blog-filter-button]');
    const defaultBlogURL = window.location.href.split('/tagged/')[0];
    const blogGrid = document.querySelector('[data-blog-grid]');

    if (!blogFilterButtons.length) return;

    blogFilterButtons.forEach((blogFilterButton) => {
      blogFilterButton.addEventListener('click', () => {
        const filterValue = blogFilterButton.getAttribute('data-value');
        let filteredURL = null;

        if (filterValue === 'all') {
          filteredURL = defaultBlogURL;
        } else {
          filteredURL = `${defaultBlogURL.split('?page')[0]}/tagged/${filterValue}`;
        }

        window.history.pushState('', '', filteredURL);

        fetch(filteredURL, {
          credentials: 'same-origin',
          headers: {
            'X-Requested-With': 'xmlhttprequest',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: 0,
          },
        })
          .then((response) => response.text())
          .then((html) => {
            const responseDOMParser = new window.DOMParser();
            const responseDocument = responseDOMParser.parseFromString(html, 'text/html');
            const responseGrid = responseDocument.querySelector('[data-blog-grid]');

            blogGrid.innerHTML = responseGrid.innerHTML;
            return null;
          })
          .catch((error) => {
            console.log(error);
          });

        blogFilterButtons.forEach((button) => {
          if (button === blogFilterButton) {
            button.classList.toggle('active');
          } else {
            button.classList.remove('active');
          }
        });
      });
    });
  }
}

customElements.get('blog-filter') || customElements.define('blog-filter', BlogFilter);
