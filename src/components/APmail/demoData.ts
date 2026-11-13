import type { EmailItem } from './types';

export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'msg-1',
    uid: 101,
    from: { name: 'Google Cloud Platform', address: 'billing@google.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Google Cloud Invoice - Project: mythos-cluster',
    date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    snippet: 'Your monthly invoice is available. Total: $14.28. Automatic deduction scheduled for Nov 15.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #202124; line-height: 1.6;">
        <h2 style="color: #1a73e8; margin-top: 0; font-size: 18px;">Google Cloud</h2>
        <p>Your statement is ready for review.</p>
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
        filename: 'Invoice_GCP_Nov2026.pdf',
        contentType: 'application/pdf',
        size: 145000,
      }
    ],
    labels: ['Billing']
  },
  {
    id: 'msg-2',
    uid: 102,
    from: { name: 'GitHub Notifications', address: 'notifications@github.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: '[LAB] PR #14 merged: "feat(apmail): dedicated mobile suite & undo send"',
    date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    snippet: 'PR #14 successfully merged into main. Automated build and lint checks passed with zero errors.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #24292f; line-height: 1.5;">
        <div style="display: inline-block; background: #8250df; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">Merged</div>
        <h3 style="margin: 0 0 8px 0; color: #0969da;">feat(apmail): dedicated mobile suite & undo send</h3>
        <p style="margin: 0; color: #57606a; font-size: 13px;">Branch <code>main</code> updated with clean commits. All tests green.</p>
      </div>
    `,
    bodyText: 'PR #14 merged: feat(apmail): dedicated mobile suite & undo send into main.',
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
    from: { name: 'Vercel Platform', address: 'notifications@vercel.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Production Deployment Ready: yashoo.vercel.app',
    date: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    snippet: 'Your production build succeeded in 3.04s and is live globally across all Edge CDN points of presence.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #000; line-height: 1.5;">
        <h3 style="margin-top: 0; color: #0070f3;">Vercel Production Deployment: Succeeded</h3>
        <p style="font-size: 14px; color: #333;">Domain: <a href="https://yashoo.vercel.app" style="color: #0070f3; font-weight: 600;">yashoo.vercel.app</a></p>
        <p style="font-size: 12px; color: #666;">Edge Cache: HIT | Duration: 3.04s | Status: Ready</p>
      </div>
    `,
    bodyText: 'Deployment Ready: yashoo.vercel.app',
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
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'APmail minimal tokens & layout review',
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    snippet: 'Simplified the design to match your request: less text, cleaner paddings, and instant inline reply.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #1f1f1f; line-height: 1.6;">
        <p>Hey there,</p>
        <p>Refined the UI according to your feedback: stripped out all redundant text, tightened paddings, and created a dedicated mobile layout.</p>
        <p>Check the attached design specs and let me know your thoughts!</p>
        <p>Best,<br>Sarah</p>
      </div>
    `,
    bodyText: 'Refined the UI: stripped out unnecessary text and tightened paddings.',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'primary',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-2',
        filename: 'apmail_design_spec_v2.png',
        contentType: 'image/png',
        size: 320000,
      }
    ],
    labels: ['Design']
  },
  {
    id: 'msg-5',
    uid: 105,
    from: { name: 'Google Security', address: 'no-reply@accounts.google.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Google App Password confirmed for APmail',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    snippet: 'A dedicated 16-character App Password is active. You can manage or revoke it anytime in Google Security.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #202124;">
        <h3 style="color: #202124;">Google Security Notice</h3>
        <p>App Password active: <strong>APmail Client</strong></p>
        <p style="font-size: 13px; color: #5f6368;">Connected to your mailbox with encrypted session tokens.</p>
      </div>
    `,
    bodyText: 'Google App Password confirmed for APmail',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'updates',
    hasAttachments: false,
  },
  {
    id: 'msg-6',
    uid: 106,
    from: { name: 'Figma Team', address: 'news@figma.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'New in Figma: AI Visual Canvas and Smart Layouts',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    snippet: 'Discover the latest capabilities in spatial interface design, responsive constraints, and design systems.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h3 style="color: #0d99ff;">Figma Product Updates</h3>
        <p>Learn how top product teams build adaptive web and mobile layouts in record time.</p>
      </div>
    `,
    bodyText: 'New in Figma: AI Visual Canvas and Smart Layouts',
    isRead: false,
    isStarred: false,
    folder: 'INBOX',
    category: 'promotions',
    hasAttachments: false,
  },
  {
    id: 'msg-7',
    uid: 107,
    from: { name: 'Twitter / X', address: 'info@x.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Trending in Tech: Next-generation agentic developer tools',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    snippet: 'Explore the top trending repositories and discussions in modern web and distributed systems.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <p>Trending in Tech: Next-generation agentic developer tools and high speed clients.</p>
      </div>
    `,
    bodyText: 'Trending in Tech: Next-generation agentic developer tools and high speed clients.',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'social',
    hasAttachments: false,
  },
  {
    id: 'msg-8',
    uid: 108,
    from: { name: 'Stripe', address: 'support@stripe.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Payout scheduled: $1,450.00 is on its way',
    date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    snippet: 'Your scheduled payout of $1,450.00 has been initiated to your bank account ending in 4102.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #3c4257;">
        <h3 style="color: #635bff;">Payout Initiated</h3>
        <p>Your daily payout has been processed. Estimated arrival: 1-2 business days.</p>
        <p style="font-weight: bold; font-size: 18px;">$1,450.00 USD</p>
      </div>
    `,
    bodyText: 'Payout scheduled: $1,450.00 has been initiated.',
    isRead: false,
    isStarred: true,
    folder: 'INBOX',
    category: 'updates',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-3',
        filename: 'payout_summary_nov2026.pdf',
        contentType: 'application/pdf',
        size: 92000,
      }
    ],
  },
  {
    id: 'msg-9',
    uid: 109,
    from: { name: 'Supabase Team', address: 'no-reply@supabase.io' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'PostgreSQL 17 upgrade available for your databases',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    snippet: 'Zero-downtime upgrades are now live with 25% faster query processing and native vector index acceleration.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h3 style="color: #3ecf8e;">PostgreSQL 17 on Supabase</h3>
        <p>Upgrade with a single click from your project dashboard with zero data downtime.</p>
      </div>
    `,
    bodyText: 'PostgreSQL 17 upgrade available for your databases.',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'updates',
    hasAttachments: false,
  },
  {
    id: 'msg-10',
    uid: 110,
    from: { name: 'Linear', address: 'notifications@linear.app' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Cycle 42 completed: 18 issues resolved',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    snippet: 'Your team completed 100% of planned cycle issues. View retrospective analytics and velocity metrics.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h3 style="color: #5e6ad2;">Cycle 42 Complete</h3>
        <p>18 issues completed with 0 blockers. Ready to plan Cycle 43.</p>
      </div>
    `,
    bodyText: 'Cycle 42 completed: 18 issues resolved.',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'primary',
    hasAttachments: false,
  },
  {
    id: 'msg-11',
    uid: 111,
    from: { name: 'Product Hunt', address: 'digest@producthunt.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Top products of the day: Autonomous web workspaces',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    snippet: 'Check out the top 5 tools featured today by the developer community with over 1,200 upvotes.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h3 style="color: #da552f;">Top Products Today</h3>
        <p>Discover innovative software crafted by builders around the world.</p>
      </div>
    `,
    bodyText: 'Top products of the day: Autonomous web workspaces.',
    isRead: true,
    isStarred: false,
    folder: 'INBOX',
    category: 'promotions',
    hasAttachments: false,
  },
  {
    id: 'msg-12',
    uid: 112,
    from: { name: 'LinkedIn', address: 'messages-noreply@linkedin.com' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'David Chen sent you a message: "Collaboration on Next.js client"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    snippet: 'David: Saw your latest work on the web sandbox! Are you open for a quick sync this week?',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <p><strong>David Chen:</strong> "Saw your latest work on the web sandbox! Are you open for a quick sync this week?"</p>
      </div>
    `,
    bodyText: 'David Chen: Saw your latest work on the web sandbox! Are you open for a quick sync this week?',
    isRead: false,
    isStarred: true,
    folder: 'INBOX',
    category: 'social',
    hasAttachments: false,
  },
  // Starred folder items
  {
    id: 'msg-13',
    uid: 113,
    from: { name: 'Elena Rostova', address: 'elena@archstudio.design' },
    to: [{ name: 'You', address: 'me@gmail.com' }],
    subject: 'Contract & Architecture Milestone Sign-off',
    date: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    snippet: 'Attached the signed digital agreement and verified payment confirmation for milestone 2.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <p>Hi,</p>
        <p>All sign-offs are complete and filed. Looking forward to our next deployment sprint.</p>
        <p>Best regards,<br>Elena</p>
      </div>
    `,
    bodyText: 'All sign-offs are complete and filed. Attached signed agreement.',
    isRead: true,
    isStarred: true,
    folder: 'STARRED',
    category: 'primary',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-4',
        filename: 'Signed_Milestone_Agreement.pdf',
        contentType: 'application/pdf',
        size: 512000,
      }
    ],
  },
  // Sent folder items
  {
    id: 'sent-1',
    uid: 201,
    from: { name: 'You', address: 'me@gmail.com' },
    to: [{ name: 'Sarah Miller', address: 'sarah.ux@designcraft.io' }],
    subject: 'Re: APmail minimal tokens & layout review',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    snippet: 'Thanks Sarah! The mobile layout is looking super sharp and responsive. Approved to proceed.',
    bodyHtml: `<div><p>Thanks Sarah! The mobile layout is looking super sharp and responsive. Approved to proceed.</p></div>`,
    bodyText: 'Thanks Sarah! The mobile layout is looking super sharp and responsive. Approved to proceed.',
    isRead: true,
    isStarred: false,
    folder: 'SENT',
    hasAttachments: false,
  },
  {
    id: 'sent-2',
    uid: 202,
    from: { name: 'You', address: 'me@gmail.com' },
    to: [{ name: 'David Chen', address: 'david@venturelabs.co' }],
    subject: 'Re: Collaboration on Next.js client',
    date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    snippet: 'Sounds great David. Let us sync on Thursday afternoon.',
    bodyHtml: `<div><p>Sounds great David. Let us sync on Thursday afternoon.</p></div>`,
    bodyText: 'Sounds great David. Let us sync on Thursday afternoon.',
    isRead: true,
    isStarred: false,
    folder: 'SENT',
    hasAttachments: false,
  },
  // Drafts
  {
    id: 'draft-1',
    uid: 301,
    from: { name: 'You', address: 'me@gmail.com' },
    to: [{ address: 'team@eventology.io' }],
    subject: 'Q4 2026 Strategy & Release Schedule',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    snippet: 'Here is the draft agenda for our upcoming product sprint and customer onboardings...',
    bodyHtml: `<div><p>Here is the draft agenda for our upcoming product sprint and customer onboardings...</p></div>`,
    bodyText: 'Here is the draft agenda for our upcoming product sprint and customer onboardings...',
    isRead: true,
    isStarred: false,
    folder: 'DRAFTS',
    hasAttachments: false,
  }
];
