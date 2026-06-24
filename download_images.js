const fs = require('fs');
const https = require('https');
const urlRedirect = require('url');

const urls = {
  'logo.png': 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=100075672860291',
  'tequenos.jpg': 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3821023419413176960',
  'pastelitos.jpg': 'https://lookaside.fbsbx.com/lookaside/crawler/threads/C_GcgwTuKnf/0/image.jpg',
  'empanadas.jpg': 'https://www.tiktok.com/api/img/?itemId=7493683228281277751&location=0&aid=1988',
  'congelados.jpg': 'https://www.tiktok.com/api/img/?itemId=7182284609000918278&location=0&aid=1988'
};

function download(url, dest) {
  const requestOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  };

  https.get(url, requestOptions, function(response) {
    if (response.statusCode === 302 || response.statusCode === 301) {
      // Resolve relative redirects
      let redirectUrl = response.headers.location;
      if (!redirectUrl.startsWith('http')) {
        const parsed = urlRedirect.parse(url);
        redirectUrl = parsed.protocol + '//' + parsed.host + redirectUrl;
      }
      download(redirectUrl, dest);
      return;
    }

    if (response.statusCode !== 200) {
      console.error(`Error downloading ${dest}: Status code ${response.statusCode}`);
      return;
    }

    const file = fs.createWriteStream(dest);
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log(`Downloaded ${dest} successfully!`);
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {});
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
}

for (const [filename, url] of Object.entries(urls)) {
  download(url, filename);
}
