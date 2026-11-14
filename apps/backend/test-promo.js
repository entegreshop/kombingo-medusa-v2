const Medusa = require('@medusajs/js-sdk').default;
const sdk = new Medusa({ baseUrl: 'http://localhost:9000', maxRetries: 0 });

async function testPromo(attribute) {
  try {
    const res = await sdk.admin.promotion.create({
      code: 'TEST_PROMO_' + attribute.replace(/[^a-zA-Z0-9]/g, '_'),
      type: 'standard',
      is_automatic: true,
      application_method: {
        type: 'percentage',
        target_type: 'items',
        value: 10,
        target_rules: [{ attribute: attribute, operator: 'in', values: ['prod_123'] }]
      }
    }, {
        headers: {
            "Authorization": "Basic " + Buffer.from("admin@medusa-test.com:supersecret").toString('base64')
        }
    });
    console.log("SUCCESS with", attribute);
  } catch (e) {
    if (e.response && e.response.data) {
        console.error("FAIL with", attribute, JSON.stringify(e.response.data));
    } else {
        console.error("FAIL with", attribute, e.message);
    }
  }
}

async function run() {
    await testPromo('product_id');
    await testPromo('items.product.id');
    await testPromo('items.product_id');
    await testPromo('item.product_id');
}
run();
