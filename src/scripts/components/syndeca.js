function addSyndecaEvent() {
  window.addEventListener('message', receiveSyndecaMessage, false);
}

function receiveSyndecaMessage(event) {
  if (event.origin !== window.syndecaOrigin) {
    return;
  }

  const message = JSON.parse(event.data);
  if (message.action !== 'addToBag') {
    return;
  }

  const { product } = message;
  const variantId = Number(product.id.split('_').at(-1));
  if (variantId === null || variantId === '') {
    return;
  }

  const lineItems = {
    items: [
      {
        id: variantId,
        quantity: product.quantity,
        properties: {
          _syndeca: true,
        },
      },
    ],
  };

  window.cartAPI.cartAdd(lineItems, true);
}

document.addEventListener('DOMContentLoaded', () => {
  addSyndecaEvent();
});
