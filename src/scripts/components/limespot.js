function limespotInit() {
  const boxes = document.querySelectorAll('limespot-box');

  if (!boxes.length) {
    return;
  }

  boxes.forEach((box) => {
    const collectionItems = box.querySelectorAll('.limespot-recommendation-box-item');

    if (!collectionItems.length) {
      return;
    }

    collectionItems.forEach((collectionItem) => {
      const handle = collectionItem.getAttribute('data-display-url')
        ? collectionItem.getAttribute('data-display-url').split('/products/')[1].split('?')[0]
        : null;

      if (!handle) {
        return;
      }

      fetch(`/products/${handle}?view=collection-item`, {
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
          const responseSwatches = responseDocument.querySelector('[data-collection-item-swatches-wrapper]');
          const responseRating = responseDocument.querySelector('[data-collection-item-rating-wrapper]');
          const newInfoBox = document.createElement('div');
          const hasSwatches = collectionItem.querySelector('[data-collection-item-swatches]');

          if (hasSwatches) {
            return;
          }

          newInfoBox.classList.add('ls-info-wrap');
          newInfoBox.innerHTML = collectionItem.querySelector('.ls-info-wrap').innerHTML;
          collectionItem.querySelector('.ls-info-wrap').remove();

          if (responseSwatches) {
            const swatchesElement = document.createElement('div');
            swatchesElement.innerHTML = responseSwatches.innerHTML;
            collectionItem.appendChild(swatchesElement);
          }

          collectionItem.appendChild(newInfoBox);

          if (responseRating) {
            const ratingElement = document.createElement('div');
            ratingElement.innerHTML = responseRating.innerHTML;
            collectionItem.appendChild(ratingElement);
          }

          function collectionItemSwatchesInit() {
            const collectionItemSwatchesParents = document.querySelectorAll('[data-collection-item-swatches]');
            const collectionItemSwatches = document.querySelectorAll('[data-collection-item-swatch]');

            if (!collectionItemSwatches.length) {
              return;
            }

            collectionItemSwatches.forEach((collectionItemSwatch) => {
              collectionItemSwatch.addEventListener('click', () => {
                const isLimespot = collectionItemSwatch.closest('.limespot-recommendation-box-item');

                if (!isLimespot || !collectionItemSwatch.hasAttribute('data-variant-image')) {
                  return;
                }

                const collectionItemImage = collectionItemSwatch
                  .closest('.limespot-recommendation-box-item')
                  .querySelector('.ls-image');
                const variantImage = collectionItemSwatch.getAttribute('data-variant-image');
                const siblingSwatches = collectionItemSwatch
                  .closest('.limespot-recommendation-box-item')
                  .querySelectorAll('[data-collection-item-swatch]');

                if (!collectionItemImage) {
                  return;
                }

                siblingSwatches.forEach((swatch) => {
                  if (swatch === collectionItemSwatch) {
                    swatch.classList.add('active');
                  } else {
                    swatch.classList.remove('active');
                  }
                });

                collectionItemImage.removeAttribute('srcset');
                collectionItemImage.setAttribute('src', variantImage);
              });
            });

            collectionItemSwatchesParents.forEach((collectionItemSwatchesParent) => {
              const activeSwatch = collectionItemSwatchesParent.querySelector('[data-collection-item-swatch].active');

              if (activeSwatch) {
                return;
              }

              const firstSwatch = collectionItemSwatchesParent.querySelector('[data-collection-item-swatch]');

              firstSwatch.classList.add('active');

              setTimeout(() => {
                firstSwatch.click();
              }, 200);
            });
          }

          collectionItemSwatchesInit();

          return null;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });
}

window.addEventListener('fetchSwatchesAndReviewStars', () => {
  limespotInit();
});
