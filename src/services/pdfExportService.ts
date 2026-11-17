import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuditReport } from '../types/seo';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Capture an HTML element using html2canvas and export as a multi-page A4 PDF document using jsPDF.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string = 'report.pdf'
): Promise<void> {
  // Ensure background color and clean rendering
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200, // Fixed width for consistent print layout
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add subsequent pages if content exceeds A4 height
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

/**
 * Generates a dedicated, professionally styled PDF document for an SEO Audit Report.
 */
export async function exportAuditReportToPdf(report: AuditReport): Promise<void> {
  const hostname = new URL(report.url).hostname;
  const dateStr = new Date(report.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Create an offscreen styled container specifically optimized for PDF rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '1000px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  container.innerHTML = `
    <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="background-color: #ede9fe; color: #4338ca; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Rankora SEO Audit Report</span>
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 12px 0 6px 0; word-break: break-all;">${escapeHtml(report.url)}</h1>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Audited on ${escapeHtml(dateStr)} • Status Code: HTTP ${report.httpStatus} • Response Time: ${report.responseTimeMs}ms • Size: ${report.pageSizeKb} KB</p>
        </div>
        <div style="text-align: right;">
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #ffffff; padding: 14px 22px; border-radius: 16px; display: inline-block; text-align: center; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
            <div style="font-size: 32px; font-weight: 900; line-height: 1;">${report.scores.overall}</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85; margin-top: 4px;">Rankora Score</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Scores -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 22px; font-weight: 800; color: #2563eb;">${report.scores.onPage}/100</div>
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">On-Page SEO</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 22px; font-weight: 800; color: #4f46e5;">${report.scores.technical}/100</div>
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">Technical SEO</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 22px; font-weight: 800; color: #9333ea;">${report.scores.content}/100</div>
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">Content Quality</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 22px; font-weight: 800; color: #059669;">${report.scores.offPage ?? 0}/100</div>
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">Off-Page Trust</div>
      </div>
    </div>

    <!-- Issue Summary Statistics -->
    <div style="background: #f1f5f9; border-radius: 14px; padding: 18px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
      <div>
        <span style="font-size: 20px; font-weight: 900; color: #dc2626;">${report.counts.critical}</span>
        <div style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Critical Errors</div>
      </div>
      <div>
        <span style="font-size: 20px; font-weight: 900; color: #ea580c;">${report.counts.high}</span>
        <div style="font-size: 10px; font-weight: 700; color: #9a3412; text-transform: uppercase;">High Priority</div>
      </div>
      <div>
        <span style="font-size: 20px; font-weight: 900; color: #d97706;">${report.counts.medium + (report.counts.low || 0)}</span>
        <div style="font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase;">Medium & Low</div>
      </div>
      <div>
        <span style="font-size: 20px; font-weight: 900; color: #16a34a;">${report.counts.passed}</span>
        <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">Passed Checks</div>
      </div>
    </div>

    <!-- Top Actionable Issues Section -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        Actionable Recommendations (${report.issues.length} Audits Evaluated)
      </h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${report.issues
          .slice(0, 15) // Top 15 issues for PDF conciseness
          .map((issue) => {
            const isCrit = issue.severity === 'critical' || issue.severity === 'high';
            const badgeBg = isCrit ? '#fef2f2' : issue.severity === 'passed' ? '#f0fdf4' : '#fffbeb';
            const badgeColor = isCrit ? '#991b1b' : issue.severity === 'passed' ? '#166534' : '#92400e';
            const badgeBorder = isCrit ? '#fecaca' : issue.severity === 'passed' ? '#bbf7d0' : '#fef08a';

            return `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid ${
                isCrit ? '#dc2626' : issue.severity === 'passed' ? '#16a34a' : '#d97706'
              }; border-radius: 10px; padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${escapeHtml(issue.title)}</span>
                  <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">${escapeHtml(issue.severity)}</span>
                </div>
                <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;">${escapeHtml(issue.whyItMatters)}</p>
                <div style="background: #f8fafc; border-radius: 6px; padding: 8px; font-size: 11px; color: #1e293b;">
                  <strong>Fix Suggestion:</strong> ${escapeHtml(issue.solution)}${issue.suggestedFix ? ` <br/><code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-size: 10px;">${escapeHtml(issue.suggestedFix)}</code>` : ''}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>

    <!-- Metadata Overview -->
    <div style="margin-bottom: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
      <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Page Metadata Architecture</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; font-weight: 700; color: #475569; width: 140px;">Title Tag</td>
          <td style="padding: 8px; color: #0f172a; font-weight: 600;">${escapeHtml(report.pageInfo?.title || '[Missing Title]')} (${report.pageInfo?.titleLength || 0} chars)</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; font-weight: 700; color: #475569;">Meta Description</td>
          <td style="padding: 8px; color: #0f172a;">${escapeHtml(report.pageInfo?.metaDescription || '[Missing Meta Description]')} (${report.pageInfo?.metaDescriptionLength || 0} chars)</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; font-weight: 700; color: #475569;">Canonical URL</td>
          <td style="padding: 8px; font-family: monospace; color: #2563eb;">${escapeHtml(report.pageInfo?.canonical || '[No Canonical Defined]')}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; font-weight: 700; color: #475569;">H1 Heading</td>
          <td style="padding: 8px; color: #0f172a; font-weight: 700;">${escapeHtml(report.headings.h1[0] || '[No H1 Heading Found]')}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: 700; color: #475569;">Links Profile</td>
          <td style="padding: 8px; color: #0f172a;">${report.links.internalCount} Internal Links • ${report.links.externalCount} External Outbound</td>
        </tr>
      </table>
    </div>

    <!-- PDF Footer -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
      <span>Generated by Rankora • Smarter SEO. Open to Everyone.</span>
      <span>100% Free Forever • No Registration Required</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    await exportElementToPdf(container, `Rankora-SEO-Audit-${hostname}-${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generates a styled PDF document for a Schema Markup entity.
 */
export async function exportSchemaToPdf(
  schemaType: string,
  schemaObj: any,
  snippet: string
): Promise<void> {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '900px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  const propertiesList = Object.entries(schemaObj)
    .filter(([key]) => key !== '@context')
    .map(([key, val]) => {
      const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; font-weight: 700; color: #6d28d9; font-family: monospace; width: 180px;">${escapeHtml(key)}</td>
          <td style="padding: 8px 12px; color: #1e293b; font-size: 11px; word-break: break-all;">${escapeHtml(displayVal)}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="border-bottom: 3px solid #7c3aed; padding-bottom: 18px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="background-color: #f3e8ff; color: #6b21a8; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">Schema.org JSON-LD Specification</span>
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 10px 0 4px 0;">${escapeHtml(schemaType)} Schema Markup</h1>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Generated on ${escapeHtml(dateStr)} • Valid Google Rich Snippet Syntax</p>
        </div>
        <div style="background: #6d28d9; color: #ffffff; padding: 10px 18px; border-radius: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
          @type: ${escapeHtml(schemaType)}
        </div>
      </div>
    </div>

    <!-- Properties Summary Table -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Schema Property Map</h3>
      <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; font-size: 12px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569;">
            <th style="padding: 8px 12px;">Property Key</th>
            <th style="padding: 8px 12px;">Configured Value</th>
          </tr>
        </thead>
        <tbody>
          ${propertiesList}
        </tbody>
      </table>
    </div>

    <!-- Formatted Code Block -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Embed Code Snippet (&lt;script type="application/ld+json"&gt;)</h3>
      <div style="background: #090d16; color: #34d399; padding: 18px; border-radius: 12px; font-family: monospace; font-size: 11px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; border: 1px solid #1e293b;">
${snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </div>

    <!-- Implementation Instructions -->
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; font-size: 11px; color: #1e40af; margin-bottom: 20px;">
      <strong>How to install on your website:</strong> Copy and paste the script snippet above directly inside the <code>&lt;head&gt;...&lt;/head&gt;</code> HTML section of your website page. Test your page using Google's Rich Results Test tool.
    </div>

    <!-- PDF Footer -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
      <span>Rankora SEO Suite — Schema Generator</span>
      <span>Smarter SEO. Open to Everyone. • No Registration Required</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    await exportElementToPdf(container, `Rankora-Schema-${schemaType}-${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
