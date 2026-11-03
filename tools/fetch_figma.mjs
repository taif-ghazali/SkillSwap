import https from 'node:https';

const url = 'https://www.figma.com/proto/8tnGWaLD2Z6p4rjjpdV10F/Skillswap?node-id=9-2016';

function fetchUrl(target) {
  https.get(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirect to:', res.headers.location);
      fetchUrl(res.headers.location);
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      const title = data.match(/<title>([^<]+)<\/title>/);
      console.log('Title:', title ? title[1] : 'none');
      const ogDesc = data.match(/<meta property="og:description" content="([^"]+)"/);
      console.log('Description:', ogDesc ? ogDesc[1] : 'none');
      const ogImage = data.match(/<meta property="og:image" content="([^"]+)"/);
      console.log('OG Image:', ogImage ? ogImage[1] : 'none');
    });
  }).on('error', err => console.error(err));
}

fetchUrl(url);

