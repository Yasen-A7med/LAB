import React, { useState, useEffect, useRef } from 'react';
import { useAPmail } from './APmailContext';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Send,
  Loader2,
  ArrowLeft,
  Paperclip,
  Bold,
  Italic,
  List,
  ListOrdered,
  FileText,
  Code2,
  Eye,
  Upload,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  Copy,
  ChevronDown,
} from 'lucide-react';

const TICKET_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Event Admission Ticket</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <!-- Main Ticket Plaque Card -->
        <table role="presentation" width="100%" style="max-width: 560px; margin: 0 auto; background: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 28px 22px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 2px solid #3b82f6;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: #3b82f6; color: #ffffff; border-radius: 9999px;">CONFIRMED PASS</span>
                    <h1 style="margin: 12px 0 4px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">GLOBAL TECH SUMMIT 2026</h1>
                    <p style="margin: 0; font-size: 13px; color: #93c5fd;">Official Digital Admission & Verification Pass</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket Details Section -->
          <tr>
            <td style="padding: 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Attendee Name</span>
                    <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 2px;">Yasen Ahmed</div>
                  </td>
                  <td style="padding-bottom: 16px; text-align: right; vertical-align: top;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Ticket Tier</span>
                    <div style="font-size: 16px; font-weight: 700; color: #10b981; margin-top: 2px;">VIP All-Access</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Date & Time</span>
                    <div style="font-size: 14px; font-weight: 600; color: #e5e7eb; margin-top: 2px;">Nov 20, 2026 • 06:00 PM EST</div>
                  </td>
                  <td style="padding-bottom: 16px; text-align: right; vertical-align: top;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Seat / Row</span>
                    <div style="font-size: 14px; font-weight: 600; color: #e5e7eb; margin-top: 2px;">Main Hall • Row A, Seat 14</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-bottom: 20px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Venue Address</span>
                    <div style="font-size: 14px; font-weight: 600; color: #e5e7eb; margin-top: 2px;">Metropolitan Convention Center, Grand Ballroom</div>
                  </td>
                </tr>
              </table>

              <!-- Perforated Tear Line -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 8px 0 24px;">
                <tr>
                  <td style="border-top: 2px dashed #374151;"></td>
                </tr>
              </table>

              <!-- High Contrast QR Code Plaque -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: #ffffff; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                      <svg width="140" height="140" viewBox="0 0 100 100" fill="#000000" style="display: block;">
                        <!-- Outer Frames -->
                        <rect x="0" y="0" width="30" height="30" fill="#000000"/>
                        <rect x="5" y="5" width="20" height="20" fill="#ffffff"/>
                        <rect x="10" y="10" width="10" height="10" fill="#000000"/>
                        <rect x="70" y="0" width="30" height="30" fill="#000000"/>
                        <rect x="75" y="5" width="20" height="20" fill="#ffffff"/>
                        <rect x="80" y="10" width="10" height="10" fill="#000000"/>
                        <rect x="0" y="70" width="30" height="30" fill="#000000"/>
                        <rect x="5" y="75" width="20" height="20" fill="#ffffff"/>
                        <rect x="10" y="80" width="10" height="10" fill="#000000"/>
                        <!-- QR Modules -->
                        <rect x="36" y="8" width="8" height="8" fill="#000000"/>
                        <rect x="50" y="14" width="12" height="8" fill="#000000"/>
                        <rect x="38" y="24" width="8" height="14" fill="#000000"/>
                        <rect x="52" y="30" width="14" height="6" fill="#000000"/>
                        <rect x="8" y="40" width="12" height="12" fill="#000000"/>
                        <rect x="26" y="44" width="10" height="14" fill="#000000"/>
                        <rect x="42" y="48" width="16" height="8" fill="#000000"/>
                        <rect x="64" y="42" width="12" height="10" fill="#000000"/>
                        <rect x="82" y="40" width="10" height="12" fill="#000000"/>
                        <rect x="40" y="66" width="12" height="12" fill="#000000"/>
                        <rect x="58" y="62" width="16" height="8" fill="#000000"/>
                        <rect x="78" y="68" width="14" height="14" fill="#000000"/>
                        <rect x="42" y="84" width="10" height="8" fill="#000000"/>
                        <rect x="60" y="82" width="8" height="10" fill="#000000"/>
                        <rect x="76" y="88" width="16" height="6" fill="#000000"/>
                      </svg>
                    </div>
                    <div style="margin-top: 12px; font-family: monospace; font-size: 13px; font-weight: 700; color: #9ca3af; letter-spacing: 0.1em;">
                      TKT-2026-98421-VIP
                    </div>
                    <p style="margin: 4px 0 0; font-size: 11px; color: #6b7280;">Present this barcode or QR scan upon venue check-in</p>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://yashoo.vercel.app" target="_blank" style="display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 8px; letter-spacing: 0.02em;">
                      Add Pass to Apple Wallet / Google Pass
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background: #0b0f19; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                This admission pass is registered strictly to the ticket holder and is non-transferable without prior organizer authorization. For event assistance please contact support@eventology.org.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const NEWSLETTER_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Announcement</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 32px 32px 24px; background: #1e293b; color: #ffffff; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">YASHOO PLATFORM UPDATE</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">Discover the next generation of productivity</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">Major Feature Release is Live</h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                We are thrilled to unveil our new suite of cloud tools designed to accelerate your engineering workflows, automate routine deployments, and deliver enterprise reliability.
              </p>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #0f172a;">What's New in This Version:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                  <li>High-speed IMAP search with real-time UID synchronisation</li>
                  <li>Unified serverless router under Vercel Hobby caps</li>
                  <li>Full conversation threading & Gmail search operators</li>
                  <li>Custom HTML email composer with instant ticket preview</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 28px;">
                <a href="https://yashoo.vercel.app" target="_blank" style="display: inline-block; padding: 12px 32px; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 8px;">
                  Explore The New Dashboard →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © 2026 Yashoo LAB Inc. All rights reserved. • <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const BLANK_HTML_STARTER = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Notification</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td>
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a;">Hello from APmail</h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                Write your custom HTML message here. You can insert tables, buttons, banners, or images.
              </p>
              <div style="margin-top: 24px;">
                <a href="https://yashoo.vercel.app" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 6px;">
                  Action Button
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const APmailCompose: React.FC = () => {
  const {
    isComposeOpen,
    closeCompose,
    composeMode,
    setComposeMode,
    composeData,
    updateDraft,
    sendEmail,
    showToast,
  } = useAPmail();

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [composeType, setComposeType] = useState<'text' | 'html'>('text');
  const [htmlCode, setHtmlCode] = useState(TICKET_TEMPLATE);
  const [htmlTab, setHtmlTab] = useState<'code' | 'preview'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [uploadedHtmlName, setUploadedHtmlName] = useState<string | null>(null);

  const [attachments, setAttachments] = useState<
    { name: string; size: number; content?: string; isBase64?: boolean; contentType?: string }[]
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const htmlUploadInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const htmlEditorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isComposeOpen) {
      setTo(composeData.to || '');
      setCc(composeData.cc || '');
      setBcc(composeData.bcc || '');
      setSubject(composeData.subject || '');
      setBody(composeData.body || '');
      setAttachments(composeData.attachments || []);
      if (composeData.bodyHtml) {
        setHtmlCode(composeData.bodyHtml);
        setComposeType('html');
      }
      if (composeData.composeType) {
        setComposeType(composeData.composeType);
      }
      if (composeData.cc || composeData.bcc) {
        setShowCcBcc(true);
      }
    }
  }, [isComposeOpen, composeData]);

  if (!isComposeOpen) return null;

  const handleSend = async () => {
    if (!to.trim()) {
      showToast('Enter recipient email');
      return;
    }
    if (!subject.trim()) {
      showToast('Enter email subject');
      return;
    }

    setIsSending(true);

    let finalHtml = '';
    let finalPlainText = '';

    if (composeType === 'html') {
      finalHtml = htmlCode;
      // Strip HTML tags to make a clean plaintext fallback for non-HTML email clients
      finalPlainText = htmlCode
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      finalHtml = `<div><p>${body.replace(/\n/g, '<br>')}</p></div>`;
      finalPlainText = body;
    }

    await sendEmail({
      to: to.trim(),
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
      subject: subject.trim(),
      bodyHtml: finalHtml,
      bodyText: finalPlainText,
      inReplyTo: composeData.inReplyTo,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleHtmlUploadClick = () => {
    if (htmlUploadInputRef.current) {
      htmlUploadInputRef.current.click();
    }
  };

  const handleHtmlFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setHtmlCode(content);
          setComposeType('html');
          setHtmlTab('preview');
          setUploadedHtmlName(file.name);

          // Extract title if present and subject is empty
          const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1] && !subject) {
            setSubject(titleMatch[1].trim());
            updateDraft({ subject: titleMatch[1].trim() });
          }

          showToast(`HTML template loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newFiles = files.map((f) => ({
        name: f.name,
        size: f.size,
      }));
      const updated = [...attachments, ...newFiles];
      setAttachments(updated);
      updateDraft({ attachments: updated });
    }
  };

  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    updateDraft({ attachments: updated });
  };

  const selectTemplate = (templateHtml: string, templateSubject?: string) => {
    setHtmlCode(templateHtml);
    setComposeType('html');
    setHtmlTab('preview');
    setShowTemplateMenu(false);
    setUploadedHtmlName(null);
    if (templateSubject && !subject) {
      setSubject(templateSubject);
      updateDraft({ subject: templateSubject });
    }
    showToast('Template applied to email');
  };

  // Text formatting helpers for Plain Text
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!bodyTextareaRef.current) return;
    const el = bodyTextareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextBody = body.slice(0, start) + replacement + body.slice(end);
    setBody(nextBody);
    updateDraft({ body: nextBody });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  // Minimized Mode (Desktop only)
  if (!isMobile && composeMode === 'minimized') {
    return (
      <div className="fixed bottom-0 right-10 z-50 w-64 bg-[#001d35] dark:bg-[#20232a] text-white rounded-t-lg px-3 py-2.5 flex items-center justify-between shadow-xl cursor-pointer">
        <span
          onClick={() => setComposeMode('docked')}
          className="font-medium text-xs truncate flex-1 flex items-center gap-1.5"
        >
          {composeType === 'html' && <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
          <span>{subject || 'New Message'}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setComposeMode('docked')}
            className="p-1 hover:bg-white/10 rounded cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button onClick={closeCompose} className="p-1 hover:bg-white/10 rounded cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  const isMaximized = composeMode === 'maximized';

  return (
    <>
      {/* Background Dim for Desktop Maximized */}
      {!isMobile && isMaximized && (
        <div onClick={() => setComposeMode('docked')} className="fixed inset-0 bg-black/40 z-40" />
      )}

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
      <input
        ref={htmlUploadInputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleHtmlFileSelected}
        className="hidden"
      />

      <div
        onKeyDown={handleKeyDown}
        className={`fixed z-50 bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-150 ${
          isMobile
            ? 'inset-0 w-full h-full rounded-none border-none'
            : isMaximized
            ? 'inset-4 sm:inset-8 rounded-xl'
            : 'bottom-0 right-4 sm:right-8 w-[95vw] sm:w-[680px] h-[640px] rounded-t-xl'
        }`}
      >
        {/* Header / Title Bar */}
        <div className="h-11 px-3 bg-[#f2f6fc] dark:bg-[#20232a] rounded-t-xl flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 select-none border-b border-gray-200/50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={closeCompose}
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 mr-1"
                title="Save & Close"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="truncate max-w-[220px] flex items-center gap-1.5">
              {composeType === 'html' ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider">
                  HTML
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold uppercase tracking-wider">
                  TEXT
                </span>
              )}
              <span>{subject ? subject : 'New Message'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            {/* Attachment Button in Header (Mobile) */}
            {isMobile && (
              <button
                onClick={handleAttachClick}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full cursor-pointer"
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            )}

            {/* Send Button in Header (Mobile) */}
            {isMobile && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="p-1.5 bg-blue-600 active:bg-blue-700 text-white rounded-full cursor-pointer ml-1"
                title="Send"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Desktop Window Controls */}
            {!isMobile && (
              <>
                <button
                  onClick={() => setComposeMode('minimized')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setComposeMode(isMaximized ? 'docked' : 'maximized')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={closeCompose}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message Type Selector Bar */}
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#1c1f26] border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-gray-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setComposeType('text')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                composeType === 'text'
                  ? 'bg-white dark:bg-[#252830] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plain Text</span>
            </button>
            <button
              type="button"
              onClick={() => setComposeType('html')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                composeType === 'html'
                  ? 'bg-white dark:bg-[#252830] text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Rich HTML / Ticket</span>
            </button>
          </div>

          {/* HTML Quick Action Controls */}
          {composeType === 'html' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleHtmlUploadClick}
                className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[11px] font-medium transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                title="Upload .html or .htm file directly"
              >
                <Upload className="w-3 h-3" />
                <span>Upload HTML</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTemplateMenu((p) => !p)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Templates</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {showTemplateMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#20232a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        selectTemplate(TICKET_TEMPLATE, 'Your VIP Admission Pass - Global Tech Summit')
                      }
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col gap-0.5 cursor-pointer"
                    >
                      <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Event Ticket Plaque
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Dark VIP pass with QR code, attendee seat & tear-off
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectTemplate(NEWSLETTER_TEMPLATE, 'Official Platform Announcement & Update')
                      }
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col gap-0.5 cursor-pointer border-t border-gray-100 dark:border-gray-800"
                    >
                      <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Modern Announcement
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Header banner, feature cards, and gradient button
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectTemplate(BLANK_HTML_STARTER, 'Notification')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col gap-0.5 cursor-pointer border-t border-gray-100 dark:border-gray-800"
                    >
                      <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Blank Responsive Card
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Clean responsive starter with ready table layout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inputs Stack */}
        <div className="px-3 text-xs divide-y divide-gray-100 dark:divide-gray-800">
          {/* To Field */}
          <div className="py-2 flex items-center gap-2">
            <span className="text-gray-400 w-8 shrink-0 font-medium">To</span>
            <input
              type="email"
              autoFocus
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                updateDraft({ to: e.target.value });
              }}
              placeholder="Recipients (e.g. name@example.com)"
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none text-xs sm:text-sm font-medium"
            />
            {!showCcBcc && (
              <button
                type="button"
                onClick={() => setShowCcBcc(true)}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                Cc/Bcc
              </button>
            )}
          </div>

          {/* Cc / Bcc Fields */}
          {showCcBcc && (
            <>
              <div className="py-1.5 flex items-center gap-2">
                <span className="text-gray-400 w-8 shrink-0">Cc</span>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => {
                    setCc(e.target.value);
                    updateDraft({ cc: e.target.value });
                  }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none text-xs"
                />
              </div>
              <div className="py-1.5 flex items-center gap-2">
                <span className="text-gray-400 w-8 shrink-0">Bcc</span>
                <input
                  type="email"
                  value={bcc}
                  onChange={(e) => {
                    setBcc(e.target.value);
                    updateDraft({ bcc: e.target.value });
                  }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none text-xs"
                />
              </div>
            </>
          )}

          {/* Subject Field */}
          <div className="py-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                updateDraft({ subject: e.target.value });
              }}
              placeholder="Subject"
              className="w-full bg-transparent text-gray-900 dark:text-gray-100 font-semibold focus:outline-none text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Uploaded File Badge for HTML Mode */}
        {composeType === 'html' && uploadedHtmlName && (
          <div className="px-3 py-1 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Loaded File: <strong className="font-mono">{uploadedHtmlName}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setUploadedHtmlName(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              title="Dismiss file tag"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Attachment Chips Section */}
        {attachments.length > 0 && (
          <div className="px-3 py-1.5 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px]"
              >
                <FileText className="w-3 h-3 text-blue-500" />
                <span className="max-w-[120px] truncate">{att.name}</span>
                <span className="text-[10px] text-gray-400">({(att.size / 1024).toFixed(0)}k)</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPOSE BODY: PLAIN TEXT VS RICH HTML */}
        {/* ======================================================== */}
        {composeType === 'text' ? (
          /* Plain Text Editor */
          <div className="flex-1 p-3 flex flex-col min-h-0">
            <textarea
              ref={bodyTextareaRef}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                updateDraft({ body: e.target.value });
              }}
              placeholder="Compose email message..."
              className="flex-1 w-full bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none text-xs sm:text-sm leading-relaxed"
            />
          </div>
        ) : (
          /* Rich HTML Editor & Live Preview */
          <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50 dark:bg-[#14161b]">
            {/* HTML Subtabs (Code vs Live Preview) */}
            <div className="h-9 px-3 bg-gray-100/80 dark:bg-[#1a1d24] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHtmlTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    htmlTab === 'preview'
                      ? 'bg-white dark:bg-[#252830] text-purple-600 dark:text-purple-400 shadow-2xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHtmlTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    htmlTab === 'code'
                      ? 'bg-white dark:bg-[#252830] text-purple-600 dark:text-purple-400 shadow-2xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code Editor</span>
                </button>
              </div>

              {/* Preview Device Controls */}
              {htmlTab === 'preview' && (
                <div className="flex items-center gap-1 text-gray-500">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Mobile 375px Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Code Tab Helpers */}
              {htmlTab === 'code' && (
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(htmlCode);
                      showToast('HTML code copied to clipboard');
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    title="Copy HTML code to clipboard"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <span>•</span>
                  <span>{(htmlCode.length / 1024).toFixed(1)} KB</span>
                  <span>{htmlCode.split('\n').length} lines</span>
                </div>
              )}
            </div>

            {/* Subtab Contents */}
            {htmlTab === 'code' ? (
              <div className="flex-1 p-2 flex flex-col min-h-0 bg-[#0d1117] text-gray-200 rounded-b-none font-mono text-xs overflow-hidden">
                <textarea
                  ref={htmlEditorRef}
                  value={htmlCode}
                  onChange={(e) => {
                    setHtmlCode(e.target.value);
                    updateDraft({ bodyHtml: e.target.value, composeType: 'html' });
                  }}
                  placeholder="Paste or write raw HTML email markup here..."
                  className="flex-1 w-full bg-transparent text-emerald-300 dark:text-emerald-400 font-mono text-[11px] sm:text-xs leading-relaxed resize-none focus:outline-none p-2 selection:bg-purple-900/60 selection:text-white"
                  spellCheck={false}
                />
              </div>
            ) : (
              /* Live Preview In Sandboxed Iframe */
              <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-100 dark:bg-[#0d1015]">
                <div
                  className={`transition-all duration-200 bg-white rounded-lg shadow-md overflow-hidden flex flex-col ${
                    previewDevice === 'mobile'
                      ? 'w-[375px] max-w-full border-4 border-gray-800 dark:border-gray-700 rounded-[28px]'
                      : 'w-full h-full border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {previewDevice === 'mobile' && (
                    <div className="h-5 bg-gray-800 flex items-center justify-center">
                      <div className="w-16 h-3 bg-black rounded-b-md" />
                    </div>
                  )}
                  <iframe
                    title="HTML Email Live Preview"
                    sandbox="allow-same-origin allow-popups"
                    srcDoc={htmlCode}
                    className="w-full flex-1 border-none min-h-[380px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Action Toolbar */}
        <div className="h-12 px-3 bg-gray-50/80 dark:bg-[#20232a] border-t border-gray-200/70 dark:border-gray-800 flex items-center justify-between select-none">
          {/* Left Controls */}
          {composeType === 'text' ? (
            /* Plain Text Toolbar */
            <div className="flex items-center gap-1 text-gray-500">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n- ')}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                title="Bullet list"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n1. ')}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                title="Numbered list"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleAttachClick}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                title="Attach files"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* HTML Mode Status / File Upload Shortcut */
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <button
                type="button"
                onClick={handleHtmlUploadClick}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-1 text-purple-600 dark:text-purple-400 cursor-pointer text-[11px]"
                title="Upload another HTML file"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload File</span>
              </button>
              <button
                type="button"
                onClick={handleAttachClick}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-1 cursor-pointer text-[11px]"
                title="Add attachment"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Attach</span>
              </button>
            </div>
          )}

          {/* Desktop Send and Discard Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateDraft({ to: '', subject: '', body: '', bodyHtml: '', attachments: [] });
                closeCompose();
                showToast('Draft discarded');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer"
              title="Discard draft"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {!isMobile && (
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className={`flex items-center gap-1.5 px-4 py-2 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 ${
                  composeType === 'html'
                    ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
                }`}
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{composeType === 'html' ? 'Send HTML Email' : 'Send'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
