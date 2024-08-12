import nanoajax from 'nanoajax'

export const toQueryString = (fields) => {
  let data = '';
  let names = Object.keys(fields);
  const neededNames = names.filter(name => name !== 'meta');

  for (let i = 0; i < neededNames.length; i++) {
    let name = neededNames[i];
    let value = fields[name];

    data += `${encodeURIComponent(`shipping_address[${name}]`)}=${encodeURIComponent(value)}${i < neededNames.length - 1 ? '&' : ''}`;
  }

  return data;
};

export const requestShippingRates = (endpoint, data, cb) => {
  nanoajax.ajax({
    method: 'POST',
    url: `${endpoint}?${toQueryString(data)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, cb);
}

export const fetchShippingRates = (endpoint, data, cb) => {
  const handleResponse = (statusCode, responseText) => {
    if (statusCode === 200 || statusCode === 202) {
      const responseData = JSON.parse(responseText);
      if (responseData !== null) {
        cb(statusCode, responseData);
      } else {
        console.log('Received null response, retrying...');
        fetchShippingRates(endpoint, data, cb);
      }
    } else {
      console.error('Error:', statusCode, responseText);
    
    }
  };

  nanoajax.ajax({
    url: `${endpoint}?${toQueryString(data)}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, handleResponse);
};