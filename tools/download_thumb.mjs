import https from 'node:https';
import fs from 'node:fs';

const url = 'https://www.figma.com/file/8tnGWaLD2Z6p4rjjpdV10F/thumbnail?node-id=9-2016';

function download(target, dest) {
  https.get(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      download(res.headers.location, dest);
      return;
    }
    if (res.statusCode !== 200) {
      console.log('HTTP error:', res.statusCode);
      return;
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded to', dest, 'size:', fs.statSync(dest).size);
    });
  }).on('error', console.error);
}

download(url, 'work/figma_thumb.png');

