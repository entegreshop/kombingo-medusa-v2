async function main() {
  const baseUrl = 'http://localhost:9000';
  const regionId = 'reg_01KSRCA6D5NA613CRM5Q9BXQTT'; // Turkey

  try {
    const res = await fetch(`${baseUrl}/store/payment-providers?region_id=${regionId}`, {
      headers: {
        'x-publishable-api-key': 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274'
      }
    });
    const data = await res.json();
    console.log('Payment Providers:', data);
  } catch (e) {
    console.error('Error fetching payment providers:', e.message);
  }

  try {
    const res = await fetch(`${baseUrl}/store/shipping-options?region_id=${regionId}`, {
      headers: {
        'x-publishable-api-key': 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274'
      }
    });
    const data = await res.json();
    console.log('Shipping Options:', data);
  } catch (e) {
    console.error('Error fetching shipping options:', e.message);
  }
}

main();
