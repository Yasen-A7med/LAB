async function testInvidious() {
  const videoId = 'tNHXDNaNqsU';
  const instances = [
    'https://yewtu.be',
    'https://invidious.nerdvpn.de',
    'https://inv.nadeko.net',
    'https://invidious.no-name-given.de',
    'https://invidious.privacyredirect.com',
    'https://invidious.perennialworks.net',
    'https://inv.river.zone',
    'https://invidious.eclipso.at',
    'https://inv.tux.pizza'
  ];

  for (const inst of instances) {
    try {
      console.log('Testing Invidious instance:', inst);
      const res = await fetch(inst + '/api/v1/videos/' + videoId, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log('Status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('SUCCESS! Title:', data.title);
        const formats = data.formatStreams || data.adaptiveFormats || [];
        console.log('Formats count:', formats.length);
        if (formats.length > 0) {
          const sample = formats.find(f => f.url && f.url.startsWith('http')) || formats[0];
          console.log('Sample format:', sample.qualityLabel || sample.quality, 'URL:', sample.url.substring(0, 60));
          const testRes = await fetch(sample.url);
          console.log('Test fetch status:', testRes.status, 'Length:', testRes.headers.get('content-length'));
          if (testRes.status === 200 || testRes.status === 206) {
            console.log('BOOM! WORKING INVIDIOUS STREAM FOUND AT:', inst);
            break;
          }
        }
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}
testInvidious();
