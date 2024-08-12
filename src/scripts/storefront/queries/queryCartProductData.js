/**
 * @desc Queries a product information by id
 * @param {Number} id -> product id
 */

const queryCartProductData = (id) => {
  const graphQlVariables = {
    id: `gid://shopify/Product/${id}`,
  };

  const graphQlQuery = `
    query($id: ID!) {
      product(id: $id) {
        handle
        tags
        collections(first: 20) {
          edges {
            node {
              title
            }
          }
        }
      }
    }
  `;

  return JSON.stringify({
    query: graphQlQuery,
    variables: graphQlVariables,
  });
};

export default queryCartProductData;
