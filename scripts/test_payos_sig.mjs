import crypto from 'crypto';

const checksumKey = '56819d8221058ef46ccae6cf31a35f386816a2a4b9d4d6d2eea9b7e1031e2e03';

// PayOS sort algorithm: sort keys alphabetically, join key=value with &, null/empty excluded
function createPayOSSignature(data, key) {
  const sortedKeys = Object.keys(data).sort();
  const pairs = [];
  for (const k of sortedKeys) {
    const val = data[k];
    if (val !== null && val !== undefined && val !== '') {
      pairs.push(`${k}=${val}`);
    }
  }
  const signStr = pairs.join('&');
  return crypto.createHmac('sha256', key).update(signStr).digest('hex');
}

const data = {
  orderCode: 123,
  amount: 1000,
  description: 'Webhook registration ping',
  accountNumber: '123456',
  reference: 'PING_REF',
  transactionDateTime: '2026-10-16 18:00:00',
  currency: 'VND',
  paymentLinkId: 'link123',
  code: '00',
  desc: 'success'
};

const sig = createPayOSSignature(data, checksumKey);
console.log('Generated Signature:', sig);

const res = await fetch('http://localhost:5167/api/payment/payos-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: '00',
    desc: 'success',
    data,
    signature: sig
  })
});

console.log('HTTP Status:', res.status);
const text = await res.text();
console.log('HTTP Body:', text);
