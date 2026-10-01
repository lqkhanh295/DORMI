const fs = require('fs');
const path = require('path');

const JIRA_URL = 'https://lqkhanh292005.atlassian.net';
const EMAIL = 'lqkhanh292005@gmail.com';
const API_TOKEN = 'ATATT3xFfGF0rAPnt7JeCbuDHIbpUAn9CdU5D-bsAQeWZExmqhBjGTgppMF2I8DVtf74TPbByVwj7ueJu5iPgDcgODBfqCS-1-QgCS-Hnem15J2VVd01AMMd3puBRE6_kA3XiEGD-2uluNzC9ahvsJLorlIfO7-q5oN6IpzKujHS5vFNPCpAeGA=361C5AD6';
const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

async function attach() {
  const filePath = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\aacf0631-9c6b-473a-af30-d57a28810f31\\screenshots\\dor_9_real.png';
  const fileBytes = fs.readFileSync(filePath);
  const boundary = '----WebKitFormBoundaryAttach9';

  const pre = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="dor_9_real.png"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  const post = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([pre, fileBytes, post]);

  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/DOR-9/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'X-Atlassian-Token': 'no-check',
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: body
  });

  console.log('Attach DOR-9 status:', res.status);
}

attach().catch(console.error);
