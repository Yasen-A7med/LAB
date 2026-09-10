import { Inngest } from 'inngest';

const INNGEST_EVENT_KEY = import.meta.env?.VITE_INNGEST_EVENT_KEY || 'sk-inn-apiQ99W3N7WselFCBxBHukEaHZ/9W+aEpmfj6LNFc5W3/PKxjB/r/Hyg3eHdBV9R1Pmlr2+SYsXgAgoWGQrgtmCBA';

export const inngest = new Inngest({
  id: 'yd-youtube-downloader',
  eventKey: INNGEST_EVENT_KEY,
});
