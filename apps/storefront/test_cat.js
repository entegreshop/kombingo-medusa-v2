const fetch = require('node-fetch');

async function check() {
  const url = 'https://api.kombingo.com/store/product-categories?handle=alt-giyim&fields=*category_children,*products';
  // I will just use public fetch to see if it responds or fails without API key.
  const res = await fetch(url);
  const data = await res.json();
  console.log('alt-giyim:', JSON.stringify(data, null, 2));

  const url2 = 'https://api.kombingo.com/store/product-categories?handle=' + encodeURIComponent('eşofman') + '&fields=*category_children,*products';
  const res2 = await fetch(url2);
  const data2 = await res2.json();
  console.log('esofman:', JSON.stringify(data2, null, 2));
}
check();
