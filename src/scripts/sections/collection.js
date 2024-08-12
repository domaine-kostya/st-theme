// Import CSS
import '@/styles/sections/collection.scss';

import { scrollLockOpen, scrollLockClose } from '@/scripts/core/scroll-lock';

// Snippets
import '@/scripts/snippets/collection-sorting';
import '@/scripts/snippets/collection-item';

function collectionInit() {
  const collectionFilter = document.querySelector('[data-collection-filter]');
  const collectionFilterToggle = document.querySelector('[data-collection-filter-toggle]');
  const collectionFilterCloseButtons = document.querySelectorAll('[data-collection-filter-close]');

  if (!collectionFilterToggle) {
    return;
  }

  collectionFilterToggle.addEventListener('click', () => {
    const boostFilterToggle = document.querySelector('.boost-pfs-filter-tree-mobile-button button');

    if (!boostFilterToggle) {
      return;
    }

    boostFilterToggle.click();
    collectionFilter.classList.add('active');
    scrollLockOpen();
  });

  collectionFilterCloseButtons.forEach((collectionFilterCloseButton) => {
    collectionFilterCloseButton.addEventListener('click', () => {
      const boostFilterToggle = document.querySelector('.boost-pfs-filter-tree-mobile-button button');

      if (!boostFilterToggle) {
        return;
      }

      boostFilterToggle.click();
      collectionFilter.classList.remove('active');
      scrollLockClose();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  collectionInit();
});
