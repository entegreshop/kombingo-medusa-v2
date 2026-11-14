const utils = require('@medusajs/framework/utils');

console.log('Class name:', utils.AbstractPaymentProvider.name);
console.log('Prototype methods:', Object.getOwnPropertyNames(utils.AbstractPaymentProvider.prototype));
