const fetch = require('node-fetch');

async function testPromo() {
    // 1. Get a cart id or create a new cart
    const resCart = await fetch('http://localhost:9000/store/carts', {
        method: 'POST',
        headers: {
            'x-publishable-api-key': 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274'
        }
    });
    const { cart } = await resCart.json();
    console.log("Cart ID:", cart.id);

    // 2. Add a product to the cart
    const resAdd = await fetch(`http://localhost:9000/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: {
            'x-publishable-api-key': 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            variant_id: 'variant_01J0VTVYSTW0M1AAMYQNZK8C27', // Any valid variant id, we'll try to find one
            quantity: 1
        })
    });
    const addResult = await resAdd.json();
    console.log("Add Result:", addResult.message || "Success");

    // 3. Try to apply MODA10
    const resPromo = await fetch(`http://localhost:9000/store/carts/${cart.id}`, {
        method: 'POST',
        headers: {
            'x-publishable-api-key': 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            promo_codes: ["MODA10"]
        })
    });
    const promoResult = await resPromo.json();
    console.log("Promo Result:", JSON.stringify(promoResult, null, 2));
}

testPromo();
