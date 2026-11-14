const cartId = 'cart_01KWDQRNW6C7P40XDAKEB0DTXT';
fetch(`http://localhost:9000/store/carts/${cartId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-publishable-api-key': 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274'
  },
  body: JSON.stringify({
    metadata: { test: Date.now() }
  })
}).then(res => res.json()).then(data => console.log(data.type)).catch(console.error);
