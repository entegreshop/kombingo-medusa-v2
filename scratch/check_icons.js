const icons = require('@medusajs/icons');
console.log("--- EXPORTED ICONS ---");
console.log(Object.keys(icons).filter(k => k.toLowerCase().includes('order') || k.toLowerCase().includes('cart') || k.toLowerCase().includes('bag') || k.toLowerCase().includes('shop') || k.toLowerCase().includes('list')));
