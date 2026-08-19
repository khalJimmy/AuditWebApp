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
  <title>Audit Schedule Notice - Casagrand Process Audit</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
          
          <!-- CORPORATE HEADER -->
          <tr>
            <td style="background-color:#0f172a; padding:24px 32px; text-align:left; border-bottom:3px solid #c8401a;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size:11px; font-weight:700; color:#c8401a; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:4px;">
                      CASAGRAND BUILDER PVT LTD
                    </div>
                    <div style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:-0.2px;">
                      Process &amp; Quality Audit Management
                    </div>
                    <div style="color:#94a3b8; font-size:12px; margin-top:2px;">
                      Internal Audit Scheduling Notice
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:rgba(255,255,255,0.08); color:#f8fafc; border:1px solid rgba(255,255,255,0.2); font-size:11px; font-weight:600; padding:4px 10px; border-radius:4px; letter-spacing:0.5px; text-transform:uppercase;">
                      Scheduled
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- NOTICE BANNER -->
          <tr>
            <td style="background-color:#f1f5f9; padding:14px 32px; border-bottom:1px solid #e2e8f0;">
              <div style="font-size:12.5px; color:#334155; line-height:1.5;">
                <strong style="color:#0f172a;">Official Notice:</strong> An internal process compliance audit has been scheduled for your department. Please review the operational parameters prior to the audit date.
              </div>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td style="padding:28px 32px; color:#334155; font-size:13.5px; line-height:1.6;">
              <p style="margin:0 0 16px 0; font-size:14px; font-weight:600; color:#0f172a;">
                Dear ${data.spocName || 'Department SPOC'} &amp; Head of Department,
              </p>
              <p style="margin:0 0 20px 0; color:#475569;">
                An audit session has been registered under Plan Reference <strong style="color:#0f172a;">${data.planId}</strong> for the department specified below:
              </p>

              <!-- METRICS DETAILS TABLE -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0; border-radius:6px; margin-bottom:24px; border-collapse:collapse;">
                <tr style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;" width="38%">Audit Plan ID</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:700; color:#0f172a;">${data.planId}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Department / Function</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#0f172a;">${data.department} (${data.zone} Zone)</td>
                </tr>
                <tr style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Target Audit Date</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:700; color:#c8401a;">${data.scheduledDate}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Assigned Lead Auditor</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:500; color:#1e293b;">${data.auditorName}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Notified Stakeholders</td>
                  <td style="padding:10px 14px; font-size:12px; color:#475569;">
                    ${data.spocEmail} <br/> ${data.hodEmail}
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display:inline-block; background-color:#0f172a; color:#ffffff; text-decoration:none; font-weight:600; font-size:13px; padding:12px 24px; border-radius:5px; border:1px solid #1e293b;">
                      Access Audit Management Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:11.5px; color:#64748b; text-align:center;">
                Please ensure required documentation and process evidences are prepared prior to the audit date.
              </p>
            </td>
          </tr>

          <!-- CORPORATE FOOTER -->
          <tr>
            <td style="background-color:#f8fafc; padding:18px 32px; text-align:center; border-top:1px solid #e2e8f0; font-size:11px; color:#64748b;">
              <p style="margin:0 0 3px 0; font-weight:600; color:#334155;">
                Casagrand Builder Private Limited • Quality &amp; Process Governance
              </p>
              <p style="margin:0; color:#94a3b8;">
                Automated notification from Audit Management System. Do not reply directly to this message.
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
  <title>Action Required: CAPA Response Pending - Casagrand Audit</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
          
          <!-- EXECUTIVE HEADER -->
          <tr>
            <td style="background-color:#0f172a; padding:24px 32px; text-align:left; border-bottom:3px solid #c8401a;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size:11px; font-weight:700; color:#c8401a; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:4px;">
                      CASAGRAND BUILDER PVT LTD
                    </div>
                    <div style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:-0.2px;">
                      Process Audit Findings &amp; Action Required
                    </div>
                    <div style="color:#94a3b8; font-size:12px; margin-top:2px;">
                      ${data.tatHours}-Hour Corrective Action Window
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-size:11px; font-weight:700; padding:4px 10px; border-radius:4px; letter-spacing:0.5px; text-transform:uppercase;">
                      Action Pending
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- NOTICE BANNER -->
          <tr>
            <td style="background-color:#fef2f2; padding:14px 32px; border-bottom:1px solid #fee2e2;">
              <div style="font-size:12.5px; color:#991b1b; line-height:1.5;">
                <strong>Corrective Action Plan (CAPA) Required:</strong> Audit findings for report <strong style="color:#7f1d1d;">${data.auditId}</strong> have been finalized. Please submit Root Cause Analysis, Immediate Correction, and CAPA.
              </div>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td style="padding:28px 32px; color:#334155; font-size:13.5px; line-height:1.6;">
              <p style="margin:0 0 16px 0; font-size:14px; font-weight:600; color:#0f172a;">
                Dear Department SPOC &amp; Head of Department,
              </p>
              <p style="margin:0 0 20px 0; color:#475569;">
                The internal audit for <strong style="color:#0f172a;">${data.department}</strong> (${data.zone} Zone) has concluded. Findings summary and response schedule are detailed below:
              </p>

              <!-- FINDINGS & SLA TABLE -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0; border-radius:6px; margin-bottom:24px; border-collapse:collapse;">
                <tr style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;" width="42%">Audit Reference ID</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:700; color:#0f172a;">${data.auditId}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Non-Conformances (NC)</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#b91c1c;">
                    ${data.ncCount} Non-Conformance Item${data.ncCount === 1 ? '' : 's'}
                  </td>
                </tr>
                <tr style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Observations (OBS)</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#b45309;">
                    ${data.obsCount} Observation Item${data.obsCount === 1 ? '' : 's'}
                  </td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">Dispatched Timestamp</td>
                  <td style="padding:10px 14px; font-size:12.5px; font-weight:500; color:#334155;">${data.dispatchedAt}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:10px 14px; font-size:12px; color:#64748b; font-weight:600;">SLA Window</td>
                  <td style="padding:10px 14px; font-size:13px; font-weight:700; color:#0f172a;">${data.tatHours} Hours (Target: ${data.dueAt})</td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="${data.directTokenLink}" target="_blank" style="display:inline-block; background-color:#c8401a; color:#ffffff; text-decoration:none; font-weight:600; font-size:13.5px; padding:13px 28px; border-radius:5px; box-shadow:0 1px 3px rgba(200,64,26,0.3);">
                      Submit Corrective Action Plan &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:11.5px; color:#64748b; text-align:center;">
                Direct access link configured for authorized SPOC &amp; HOD review. No credential entry required.
              </p>
            </td>
          </tr>

          <!-- CORPORATE FOOTER -->
          <tr>
            <td style="background-color:#f8fafc; padding:18px 32px; text-align:center; border-top:1px solid #e2e8f0; font-size:11px; color:#64748b;">
              <p style="margin:0 0 3px 0; font-weight:600; color:#334155;">
                Casagrand Builder Private Limited • Process Audit &amp; Quality Governance
              </p>
              <p style="margin:0; color:#94a3b8;">
                Automated SLA Notification Dispatcher • System Log Tracked
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
