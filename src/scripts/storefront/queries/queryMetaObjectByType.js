/**
 * @desc Queries a product information by Handle
 * @param {String} type -> Metaobject Type
 */

const queryMetaObjectByType = (type) => {
  const graphQlVariables = {
    type: `${type}`,
  };

  const graphQlQuery = `
    query ($type: String!) {
      metaobjects(type: $type, first: 20) {
        edges {
          node {
            id
            fields {
              key
              value
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

export default queryMetaObjectByType;
