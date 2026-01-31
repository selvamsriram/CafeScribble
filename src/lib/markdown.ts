// Simple Markdown to HTML and back conversion for Tiptap
// Handles common markdown elements including tables

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

// Helper function to parse markdown tables
function parseMarkdownTable(tableText: string): string {
  const lines = tableText.trim().split('\n');
  if (lines.length < 2) return escapeHtml(tableText);

  // Check if this looks like a table (has pipes)
  if (!lines[0].includes('|')) return escapeHtml(tableText);

  const rows: string[][] = [];
  let hasHeaderSeparator = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for header separator (e.g., | --- | --- |)
    // Match lines that only contain pipes, dashes, colons, and spaces
    if (/^[\s|:-]+$/.test(line) && line.includes('-')) {
      hasHeaderSeparator = true;
      continue;
    }

    // Parse cells from the row - handle escaped pipes
    const cells = line
      .replace(/^\|/, '') // Remove leading pipe
      .replace(/\|$/, '') // Remove trailing pipe
      .split(/(?<!\\)\|/) // Split on unescaped pipes
      .map(cell => escapeHtml(cell.trim().replace(/\\\|/g, '|'))); // Unescape and HTML-escape

    if (cells.length > 0 && cells.some(c => c !== '')) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) return escapeHtml(tableText);

  // Build HTML table
  let html = '<table>';
  
  rows.forEach((row, rowIndex) => {
    const isHeader = hasHeaderSeparator && rowIndex === 0;
    const tag = isHeader ? 'th' : 'td';
    
    html += '<tr>';
    row.forEach(cell => {
      // Cell content is already escaped
      html += `<${tag}><p>${cell}</p></${tag}>`;
    });
    html += '</tr>';
  });

  html += '</table>';
  return html;
}

// Helper to extract and process tables from markdown
function processMarkdownTables(markdown: string): string {
  // Match table blocks - consecutive lines containing pipes
  // Use a more robust pattern that handles tables without trailing pipes
  const lines = markdown.split('\n');
  const result: string[] = [];
  let tableLines: string[] = [];
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track code blocks to avoid parsing tables inside them
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      // Flush any pending table
      if (tableLines.length > 0) {
        result.push(parseMarkdownTable(tableLines.join('\n')));
        tableLines = [];
      }
      result.push(line);
      continue;
    }
    
    if (inCodeBlock) {
      result.push(line);
      continue;
    }
    
    // Check if line looks like a table row (contains pipe, not just a pipe character alone)
    const looksLikeTableRow = line.includes('|') && line.trim().length > 1;
    
    if (looksLikeTableRow) {
      tableLines.push(line);
    } else {
      // Flush any pending table
      if (tableLines.length >= 2) {
        result.push(parseMarkdownTable(tableLines.join('\n')));
      } else if (tableLines.length > 0) {
        // Not enough lines for a table, just add as-is
        result.push(...tableLines);
      }
      tableLines = [];
      result.push(line);
    }
  }
  
  // Flush any remaining table
  if (tableLines.length >= 2) {
    result.push(parseMarkdownTable(tableLines.join('\n')));
  } else if (tableLines.length > 0) {
    result.push(...tableLines);
  }
  
  return result.join('\n');
}

export function markdownToHtml(markdown: string): string {
  // Process tables first (before escaping)
  let html = processMarkdownTables(markdown);

  // Escape HTML entities first (except for our conversions)
  // But preserve already-converted table HTML
  const tableMatches: string[] = [];
  html = html.replace(/<table>[\s\S]*?<\/table>/g, (match) => {
    tableMatches.push(match);
    return `__TABLE_PLACEHOLDER_${tableMatches.length - 1}__`;
  });

  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore tables
  tableMatches.forEach((table, i) => {
    html = html.replace(`__TABLE_PLACEHOLDER_${i}__`, table);
  });

  // Headers (must be at start of line)
  html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

  // Code blocks (triple backticks)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Inline code (single backticks) - be careful not to match inside code blocks
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Task lists (must come before regular lists)
  html = html.replace(/^- \[x\] (.*)$/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="true">$1</li></ul>');
  html = html.replace(/^- \[ \] (.*)$/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="false">$1</li></ul>');

  // Unordered lists
  html = html.replace(/^- (.*)$/gm, '<ul><li>$1</li></ul>');
  html = html.replace(/^\* (.*)$/gm, '<ul><li>$1</li></ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*)$/gm, '<ol><li>$1</li></ol>');

  // Blockquotes
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

  // Merge consecutive list items
  html = html.replace(/<\/ul>\n<ul>/g, '\n');
  html = html.replace(/<\/ol>\n<ol>/g, '\n');
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Paragraphs - wrap remaining lines
  const lines = html.split('\n');
  let inTable = false;
  const wrappedLines = lines.map((line) => {
    // Track table state
    if (line.includes('<table>')) inTable = true;
    if (line.includes('</table>')) {
      inTable = false;
      return line;
    }
    
    if (
      inTable ||
      line.trim() === '' ||
      line.startsWith('<h') ||
      line.startsWith('<ul') ||
      line.startsWith('<ol') ||
      line.startsWith('<li') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<pre') ||
      line.startsWith('<hr') ||
      line.startsWith('<table') ||
      line.startsWith('</') ||
      line.includes('</li>') ||
      line.includes('</ul>') ||
      line.includes('</ol>') ||
      line.includes('</blockquote>') ||
      line.includes('<tr>') ||
      line.includes('<td>') ||
      line.includes('<th>')
    ) {
      return line;
    }
    return `<p>${line}</p>`;
  });

  return wrappedLines.join('\n');
}

// Helper function to convert HTML table to markdown
function htmlTableToMarkdown(tableHtml: string): string {
  const rows: string[][] = [];
  let hasHeader = false;

  // Extract rows
  const rowMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  
  rowMatches.forEach((rowHtml) => {
    const cells: string[] = [];
    
    // Check for header cells
    const headerCells = rowHtml.match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
    const dataCells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    
    if (headerCells.length > 0) {
      hasHeader = true;
      headerCells.forEach(cell => {
        // Extract content, removing nested tags and escaping pipes
        let content = cell
          .replace(/<th[^>]*>/gi, '')
          .replace(/<\/th>/gi, '')
          .replace(/<\/?p[^>]*>/gi, '')
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/\|/g, '\\|') // Escape pipes in content
          .trim();
        cells.push(content);
      });
    } else {
      dataCells.forEach(cell => {
        let content = cell
          .replace(/<td[^>]*>/gi, '')
          .replace(/<\/td>/gi, '')
          .replace(/<\/?p[^>]*>/gi, '')
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/\|/g, '\\|') // Escape pipes in content
          .trim();
        cells.push(content);
      });
    }
    
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  if (rows.length === 0) return '';

  // Find max columns
  const maxCols = Math.max(...rows.map(r => r.length));
  
  // Normalize rows to have same number of columns
  const normalizedRows = rows.map(row => {
    while (row.length < maxCols) row.push('');
    return row;
  });

  // Build markdown table
  const lines: string[] = [];
  
  normalizedRows.forEach((row, index) => {
    lines.push('| ' + row.join(' | ') + ' |');
    
    // Add separator after first row if it's a header
    if (index === 0 && hasHeader) {
      lines.push('| ' + row.map(() => '---').join(' | ') + ' |');
    }
  });

  // If no header was detected but we have rows, still add separator after first row
  if (!hasHeader && normalizedRows.length > 0) {
    const separator = '| ' + normalizedRows[0].map(() => '---').join(' | ') + ' |';
    lines.splice(1, 0, separator);
  }

  return lines.join('\n') + '\n';
}

export function htmlToMarkdown(html: string): string {
  let md = html;

  // Convert tables first (before other processing)
  md = md.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (match) => {
    return '\n' + htmlTableToMarkdown(match) + '\n';
  });

  // Remove wrapper divs if present
  md = md.replace(/<div[^>]*>/g, '');
  md = md.replace(/<\/div>/g, '');

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');

  // Inline code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Bold and italic
  md = md.replace(/<strong><em>(.*?)<\/em><\/strong>/gi, '***$1***');
  md = md.replace(/<em><strong>(.*?)<\/strong><\/em>/gi, '***$1***');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Strikethrough
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Task lists
  md = md.replace(/<li[^>]*data-checked="true"[^>]*>(.*?)<\/li>/gi, '- [x] $1\n');
  md = md.replace(/<li[^>]*data-checked="false"[^>]*>(.*?)<\/li>/gi, '- [ ] $1\n');

  // Regular lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>/gi, '');
  md = md.replace(/<\/ul>/gi, '');
  md = md.replace(/<ol[^>]*>/gi, '');
  md = md.replace(/<\/ol>/gi, '');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, content) => {
    return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n';
  });

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '---\n');

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');

  // Line breaks
  md = md.replace(/<br[^>]*\/?>/gi, '\n');

  // Unescape HTML entities
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");

  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}
