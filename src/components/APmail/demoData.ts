import type { EmailItem } from './types';

export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'msg-1',
    uid: 101,
    from: { name: 'Google Cloud', address: 'billing@google.com' },
    to: [{ name: 'You', address: 'alex.developer@gmail.com' }],
    subject: 'Google Cloud Invoice - Project: mythos-cluster',
    date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    snippet: 'Your monthly invoice is available. Total: $14.28. Automatic deduction scheduled for Nov 15.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #202124; line-height: 1.6;">
        <h2 style="color: #1a73e8; margin-top: 0; font-size: 18px;">Google Cloud</h2>
        <p>Your October 2026 statement is ready.</p>
        <div style="background: #f8f9fa; border: 1px solid #dadce0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #5f6368;">Total Balance Due:</p>
          <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: bold; color: #1e8e3e;">$14.28</p>
        </div>
        <p style="font-size: 12px; color: #70757a;">Automatic payment will be billed to your default card.</p>
      </div>
    `,
    bodyText: 'Google Cloud Invoice - Project: mythos-cluster. Total: $14.28.',
    isRead: false,
    isStarred: true,
    folder: 'INBOX',
    category: 'updates',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-1',
        filename: 'Invoice_GCP_Oct2026.pdf',
        contentType: 'application/pdf',
        size: 145000,
      }
    ],
    labels: ['Billing']
  },
  {
    id: 'msg-2',
    uid: 102,
    from: { name: 'GitHub', address: 'notifications@github.com' },
    to: [{ name: 'You', address: 'alex.developer@gmail.com' }],
    subject: '[LAB] PR #12 merged: "feat: APmail client integration"',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    snippet: 'PR #12 successfully merged into main. Zero build warnings across all CI checks.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #24292f; line-height: 1.5;">
        <div style="display: inline-block; background: #8250df; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">Merged</div>
        <h3 style="margin: 0 0 8px 0; color: #0969da;">feat: APmail client integration</h3>
        <p style="margin: 0; color: #57606a; font-size: 13px;">Branch <code>feature/apmail</code> merged into <code>main</code> with 8 commits.</p>
      </div>
    `,
    bodyText: 'PR #12 merged: feat: APmail client integration into main.',
    isRead: false,
    isStarred: false,
    folder: 'INBOX',
    category: 'primary',
    hasAttachments: false,
    labels: ['Dev']
  },
  {
    id: 'msg-3',
    uid: 103,
    from: { name: 'Vercel', address: 'notifications@vercel.com' },
    to: [{ name: 'You', address: 'alex.developer@gmail.com' }],
    subject: 'Deployment Ready: yashoo.vercel.app/apmail',
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    snippet: 'Your production build succeeded in 14.8s and is live globally on Edge CDN.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #000; line-height: 1.5;">
        <h3 style="margin-top: 0;">Vercel Production Deployment: Succeeded</h3>
        <p style="font-size: 14px; color: #666;">Route: <a href="https://yashoo.vercel.app/apmail" style="color: #0070f3;">yashoo.vercel.app/apmail</a></p>
        <p style="font-size: 12px; color: #999;">Edge Cache: Activated | Duration: 14.8s</p>
      </div>
    `,
    bodyText: 'Deployment Ready: yashoo.vercel.app/apmail',
    isRead: true,
    isStarred: true,
    folder: 'INBOX',
    category: 'updates',
    hasAttachments: false,
  },
  {
    id: 'msg-4',
    uid: 104,
    from: { name: 'Sarah Miller', address: 'sarah.ux@designcraft.io' },
    to: [{ name: 'You', address: 'alex.developer@gmail.com' }],
    subject: 'APmail minimal tokens & layout review',
    date: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    snippet: 'Simplified the design to match your request: less text, cleaner paddings, and instant inline reply.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #1f1f1f; line-height: 1.6;">
        <p>Hey Alex,</p>
        <p>Refined the UI according to your notes: stripped out all unnecessary text, tightened the paddings, and made the login screen super simple.</p>
        <p>Check the attached mockup preview!</p>
        <p>Sarah</p>
      </div>
    `,
    bodyText: 'Hey Alex, Refined the UI: stripped out unnecessary text and tightened paddings.',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'primary',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-2',
        filename: 'apmail_design_v2.png',
        contentType: 'image/png',
        size: 320000,
      }
    ],
    labels: ['Design']
  },
  {
    id: 'msg-5',
    uid: 105,
    from: { name: 'Google Accounts', address: 'no-reply@accounts.google.com' },
    to: [{ name: 'You', address: 'alex.developer@gmail.com' }],
    subject: 'App Password created for APmail',
    date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    snippet: 'A new 16-character App Password was created for your account. You can revoke it anytime in Security.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #202124;">
        <h3 style="color: #202124;">Google Security Notice</h3>
        <p>App Password created: <strong>APmail Client</strong></p>
        <p style="font-size: 13px; color: #5f6368;">Connected to IMAP / SMTP with encrypted credentials.</p>
      </div>
    `,
    bodyText: 'App Password created for APmail',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'updates',
    hasAttachments: false,
  },
  {
    id: 'msg-6',
    uid: 106,
    from: { name: 'Twitter / X', address: 'info@x.com' },
    to: [{ name: 'You', address: 'alex.developer@gmail.com' }],
    subject: 'Trending in Tech: Next-generation agentic developer tools',
    date: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(),
    snippet: 'Explore the top trending repositories and discussions in modern web and distributed systems.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <p>Trending in Tech: Next-generation agentic developer tools and high speed clients.</p>
      </div>
    `,
    bodyText: 'Trending in Tech: Next-generation agentic developer tools',
    isRead: false,
    isStarred: false,
    folder: 'INBOX',
    category: 'social',
    hasAttachments: false,
  },
  {
    id: 'msg-7',
    uid: 201,
    from: { name: 'You', address: 'alex.developer@gmail.com' },
    to: [{ name: 'Sarah Miller', address: 'sarah.ux@designcraft.io' }],
    subject: 'Re: APmail minimal tokens & layout review',
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    snippet: 'The minimal layout looks much better! Faster to scan and distraction-free.',
    bodyHtml: `
      <div>
        <p>The minimal layout looks much better! Faster to scan and distraction-free.</p>
      </div>
    `,
    bodyText: 'The minimal layout looks much better! Faster to scan and distraction-free.',
    isRead: true,
    isStarred: false,
    folder: 'SENT',
    hasAttachments: false,
  },
  {
    id: 'msg-8',
    uid: 301,
    from: { name: 'You', address: 'alex.developer@gmail.com' },
    to: [{ name: 'Team Lead', address: 'team@enterprise.com' }],
    subject: '[Draft] Roadmap for Q1 2027',
    date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    snippet: 'Draft notes on upcoming system architecture revisions...',
    bodyHtml: `
      <div>
        <p>Draft notes on upcoming system architecture revisions...</p>
      </div>
    `,
    bodyText: 'Draft notes on upcoming system architecture revisions...',
    isRead: true,
    isStarred: true,
    folder: 'DRAFTS',
    hasAttachments: false,
  }
];
