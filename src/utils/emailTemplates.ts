export interface AuditScheduleEmailData {
  planId: string;
  department: string;
  zone: string;
  scheduledDate: string;
  auditorName: string;
  spocName: string;
  spocEmail: string;
  hodEmail: string;
  portalUrl?: string;
}

export interface CapaClockTickingEmailData {
  auditId: string;
  department: string;
  zone: string;
  dispatchedAt: string;
  dueAt: string;
  tatHours: number;
  ncCount: number;
  obsCount: number;
  spocEmail: string;
  hodEmail: string;
  directTokenLink: string;
}

export const renderAuditScheduledEmail = (data: AuditScheduleEmailData): string => {
  const portalUrl = data.portalUrl || 'https://casagrand-audit-portal.web.app';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Scheduled - Casagrand Process Audit</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(15,23,42,0.12); border:1px solid #cbd5e1;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color:#0f172a; padding:28px 32px; text-align:left; border-bottom:4px solid #d97706;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block; background-color:#d97706; color:#ffffff; font-weight:800; font-size:12px; padding:4px 10px; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
                      CASAGRAND
                    </span>
                    <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">
                      Process Audit Command Centre
                    </h1>
                    <p style="margin:4px 0 0 0; color:#94a3b8; font-size:13px;">
                      Official Process &amp; Quality Audit Schedule Notification
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <span style="background-color:rgba(217,119,6,0.2); color:#fbbf24; border:1px solid #d97706; font-size:11px; font-weight:700; padding:6px 12px; border-radius:20px; display:inline-block;">
                      📅 SCHEDULED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INTRIGUING BANNER -->
          <tr>
            <td style="background-color:#fffbe0; padding:16px 32px; border-bottom:1px solid #fef08a;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="36" valign="top" style="font-size:22px;">📋</td>
                  <td style="font-size:13px; color:#854d0e; line-height:1.5;">
                    <strong>Attention SPOC &amp; HOD:</strong> An official process compliance audit has been scheduled for your department. Review checklists early in the portal to ensure maximum audit score.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td style="padding:32px; color:#334155; font-size:14px; line-height:1.6;">
              <p style="margin:0 0 16px 0; font-size:15px; font-weight:600; color:#0f172a;">
                Dear ${data.spocName || 'SPOC'} &amp; Department HOD,
              </p>
              <p style="margin:0 0 24px 0; color:#475569;">
                Please be informed that an upcoming Process &amp; Quality Audit plan <strong style="color:#0f172a;">${data.planId}</strong> has been assigned to <strong style="color:#0f172a;">${data.department}</strong> (${data.zone} Zone).
              </p>

              <!-- METRICS DETAILS CARD -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:24px; padding:16px;">
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;" width="40%">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Audit Plan ID</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:700; color:#0f172a;">
                    ${data.planId}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Department / Function</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:700; color:#0f172a;">
                    ${data.department} (${data.zone})
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Target Audit Date</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:700; color:#d97706;">
                    📆 ${data.scheduledDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Assigned Lead Auditor</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:600; color:#1e293b;">
                    👤 ${data.auditorName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Recipient SPOC &amp; HOD</span>
                  </td>
                  <td style="padding:8px 0; font-size:12px; color:#475569;">
                    ${data.spocEmail} <br/> ${data.hodEmail}
                  </td>
                </tr>
              </table>

              <!-- CALL TO ACTION BUTTON -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display:inline-block; background-color:#0f172a; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px; padding:14px 28px; border-radius:6px; border-bottom:3px solid #d97706; box-shadow:0 4px 12px rgba(15,23,42,0.25);">
                      🚀 Launch Audit Portal &amp; Review Checklists
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:12px; color:#64748b; text-align:center;">
                Note: Prompt compliance closing directly impacts department quarterly performance ratings.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f8fafc; padding:20px 32px; text-align:center; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8;">
              <p style="margin:0 0 4px 0; font-weight:600; color:#64748b;">
                Casagrand Process &amp; Quality Audit Management System
              </p>
              <p style="margin:0;">
                Automated Notification via Direct SMTP Relay Protocol · Do Not Reply Directly
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const renderCapaClockTickingEmail = (data: CapaClockTickingEmailData): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URGENT: CAPA SLA Clock Active - Casagrand Audit</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 12px 35px rgba(0,0,0,0.5); border:1px solid #334155;">
          
          <!-- HIGH URGENCY HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:28px 32px; text-align:left; border-bottom:4px solid #ef4444;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block; background-color:#ef4444; color:#ffffff; font-weight:800; font-size:11px; padding:4px 10px; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
                      🔥 URGENT SLA NOTICE
                    </span>
                    <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">
                      Audit Findings Dispatched!
                    </h1>
                    <p style="margin:4px 0 0 0; color:#fca5a5; font-size:13px; font-weight:600;">
                      ⏰ The ${data.tatHours}-Hour CAPA Resolution Clock Is Ticking!
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <div style="background-color:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#f87171; padding:8px 12px; border-radius:8px; text-align:center;">
                      <span style="font-size:18px; display:block;">⏱️</span>
                      <span style="font-size:10px; font-weight:800; text-transform:uppercase;">${data.tatHours}H SLA</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- COUNTDOWN ALERT STRIP -->
          <tr>
            <td style="background-color:#fef2f2; padding:16px 32px; border-bottom:1px solid #fecaca;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="36" valign="top" style="font-size:22px;">⏳</td>
                  <td style="font-size:13px; color:#991b1b; line-height:1.5;">
                    <strong>Action Required:</strong> Process audit report <strong style="color:#7f1d1d;">${data.auditId}</strong> findings have been dispatched to your department. You have strictly <strong>${data.tatHours} Hours</strong> to log Corrective &amp; Preventive Action (CAPA) before automatic escalation to HOD.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td style="padding:32px; color:#334155; font-size:14px; line-height:1.6;">
              <p style="margin:0 0 16px 0; font-size:15px; font-weight:600; color:#0f172a;">
                Dear Department SPOC (${data.spocEmail}) &amp; HOD,
              </p>
              <p style="margin:0 0 20px 0; color:#475569;">
                The Auditor Lead has finalized findings for <strong style="color:#0f172a;">${data.department}</strong> (${data.zone} Zone). The SLA timer was initiated at <strong>${data.dispatchedAt}</strong> and will expire on <strong>${data.dueAt}</strong>.
              </p>

              <!-- FINDINGS & SLA BREAKDOWN CARD -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:24px; padding:16px;">
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;" width="45%">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Audit Reference ID</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:700; color:#0f172a;">
                    ${data.auditId}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Non-Conformances (NC)</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="display:inline-block; background-color:#fee2e2; color:#dc2626; font-weight:700; font-size:12px; padding:2px 8px; border-radius:12px; border:1px solid #fca5a5;">
                      ⚠️ ${data.ncCount} Critical NCs Dispatched
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Observations (OBS)</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="display:inline-block; background-color:#fef3c7; color:#d97706; font-weight:700; font-size:12px; padding:2px 8px; border-radius:12px; border:1px solid #fde68a;">
                      🔍 ${data.obsCount} Observations
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">Clock Started (Dispatched)</span>
                  </td>
                  <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-size:12px; font-weight:600; color:#334155;">
                    ${data.dispatchedAt}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="font-size:12px; color:#64748b; font-weight:600;">SLA Deadline (${data.tatHours}h)</span>
                  </td>
                  <td style="padding:8px 0; font-size:13px; font-weight:800; color:#dc2626;">
                    🚨 ${data.dueAt}
                  </td>
                </tr>
              </table>

              <!-- PROMINENT ONE-CLICK DIRECT RESPONSE LINK -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${data.directTokenLink}" target="_blank" style="display:inline-block; background-color:#d97706; color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:16px 32px; border-radius:8px; border-bottom:4px solid #b45309; box-shadow:0 6px 16px rgba(217,119,6,0.35);">
                      ⚡ Click Here to Submit CAPA Response Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:12px; color:#64748b; text-align:center;">
                No login required. This secure direct link grants immediate access to respond to your department's audit findings.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0f172a; color:#94a3b8; padding:20px 32px; text-align:center; font-size:11px; border-top:1px solid #1e293b;">
              <p style="margin:0 0 4px 0; font-weight:700; color:#e2e8f0;">
                Casagrand Process Audit &amp; Quality Control Systems
              </p>
              <p style="margin:0; color:#64748b;">
                PostgreSQL Email Dispatch Queue · Automated SLA Clock Tracker
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
