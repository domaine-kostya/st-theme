/*
  Listen for Cart Updates with the 'cartAPI' Event Listener
  ====================================================================
  window.addEventListener('cartUpdate', ({ detail: { cartData } }) => {
    console.log(cartData)
  })
  ====================================================================
*/

window.cartAPI = new (class CartAPI {
  constructor() {
    this.cartData = {};
    this.cart();
  }

  getCartData() {
    return this.cartData;
  }

  async cart(action = 'get') {
    this.cartData = await this.cartFetch();
    window.dispatchEvent(new CustomEvent('cartApiUpdate', { // eslint-disable-line
        detail: {
          action,
          cartData: this.cartData,
        },
      }),
    );
    return this.cartData;
  }

  async cartAdd(data = null, dispatch = false) {
    if (!data) {
      return {};
    }
    try {
      await this.cartFetch('add', data);
      await wait(300);
      const cartRes = dispatch ? await this.cart() : await this.cartFetch();
      return cartRes;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async cartChange(data = null, dispatch = false) {
    if (!data) {
      return {};
    }
    try {
      const cartRes = await this.cartFetch('change', data);
      if (dispatch) {
        await this.cart();
      }
      return cartRes;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async cartUpdate(data = null, dispatch = false) {
    if (!data) {
      return {};
    }
    try {
      const cartRes = await this.cartFetch('update', data);
      if (dispatch) {
        await this.cart();
      }
      return cartRes;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async cartClear(data = null, dispatch = false) {
    if (!data) {
      return {};
    }
    try {
      const cartRes = await this.cartFetch('clear', data);
      if (dispatch) {
        await this.cart();
      }
      return cartRes;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async cartSwap(data = null, dispatch = false) {
    if (!data) {
      return {};
    }
    try {
      const itemsToRemove = data.map((item) => item.oldItemKey);
      const itemsToUpdate = {
        updates: itemsToRemove.reduce((prev, cur) => {
          prev[cur] = 0;
          return prev;
        }, {}),
      };
      await this.cartUpdate(itemsToUpdate, false);

      const itemsToAdd = {
        items: data.map((item) => item.newItem),
      };
      const cartRes = await this.cartAdd(itemsToAdd, false);

      return cartRes;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async cartFetch(action = null, data = null) {
    const willPost =
      data !== null && (action === 'add' || action === 'update' || action === 'change' || action === 'clear');

    const url = `/cart${willPost ? `/${action}` : ''}.js`;
    const req = {
      method: willPost ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest',
      },
    };
    if (willPost && action !== 'clear') {
      req.body = JSON.stringify(data);
    }

    const resData = await fetch(url, req)
      .then((response) => response.json())
      .then((result) => {
        if (result.status) {
          throw new Error(result.description);
        }
        return result;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });

    return resData;
  }
})();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
