const storefront = new (class StoreFront {
  constructor() {
    this.STOREFRONT_API_TOKEN = window.theme?.storefront?.apiToken;
    this.STORE = window.theme?.storefront?.store;
    this.invalidCredentials = false;

    if (
      typeof this.STORE !== 'undefined' &&
      typeof this.STOREFRONT_API_TOKEN !== 'undefined' &&
      this.STOREFRONT_API_TOKEN !== null
    ) {
      return;
    }

    console.warn('STOREFRONT_API_TOKEN or STORE is not set.');
    this.invalidCredentials = true;
  }

  async fetch(graphqlData) {
    if (this.invalidCredentials) return null;

    const fetchHeaders = new Headers() // eslint-disable-line
    fetchHeaders.append('x-shopify-storefront-access-token', this.STOREFRONT_API_TOKEN);
    fetchHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'POST',
      headers: fetchHeaders,
      body: graphqlData,
      redirect: 'follow',
    };
    const response = await fetch(`https://${this.STORE}/api/2023-07/graphql.json`, requestOptions);
    const result = await response.json();

    if (result.errors) {
      console.error(result.errors);

      return null;
    }

    return result.data;
  }
})();

export default storefront;
