function collectionSorting() {
  const collectionSortingSelect = document.querySelector('[data-collection-sorting]');
  const boostSorting = document.querySelector('[data-boost-sorting]');

  if (!collectionSortingSelect) {
    return;
  }

  if (window.location.href.indexOf('sort=') >= 0) {
    const params = new URLSearchParams(window.location.search);

    collectionSortingSelect.setAttribute('data-current-sorting', params.get('sort'));
  }

  const currentSorting = collectionSortingSelect.getAttribute('data-current-sorting');

  collectionSortingSelect.querySelector(`option[value=${currentSorting}]`).setAttribute('selected', true);

  collectionSortingSelect.querySelector(`option[value=${currentSorting}]`).innerHTML = `${theme.strings.sortBy} ${
    collectionSortingSelect.querySelector(`option[value=${currentSorting}]`).innerHTML
  }`;

  collectionSortingSelect.addEventListener('change', () => {
    const boostSortingLinks = boostSorting.querySelectorAll('a');

    boostSortingLinks.forEach((boostSortingLink) => {
      if (boostSortingLink.getAttribute('data-sort') !== collectionSortingSelect.value) {
        return;
      }

      boostSortingLink.click();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  collectionSorting();
});
