const fetch = require('node-fetch'); // or just use global fetch if Node 18+

async function testPromo(attribute) {
  try {
    const res = await fetch("http://localhost:9000/admin/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer admin_api_token_if_needed_or_cookie" // wait, without auth this fails.
      },
      body: JSON.stringify({
        code: "TEST_" + attribute.replace(/[^a-zA-Z0-9]/g, '_'),
        type: "standard",
        is_automatic: true,
        application_method: {
          type: "percentage",
          target_type: "items",
          value: 10,
          target_rules: [{ attribute, operator: "in", values: ["prod_123"] }]
        }
      })
    });
    const data = await res.json();
    console.log("Attribute:", attribute, "Status:", res.status, "Response:", data);
  } catch (e) {
    console.error("Error for", attribute, e);
  }
}

// Without auth we can't do this easily.
