// Simple Markdown to HTML and back conversion for Tiptap
// Handles common markdown elements

export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities first (except for our conversions)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must be at start of line)
  html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
  });

  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote><p>$1</p></blockquote>');
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Task lists
  html = html.replace(/^- \[x\]\s+(.*)$/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>$1</p></div></li></ul>');
  html = html.replace(/^- \[ \]\s+(.*)$/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>$1</p></div></li></ul>');

  // Unordered lists
  html = html.replace(/^[-*]\s+(.*)$/gm, '<ul><li><p>$1</p></li></ul>');
  // Merge consecutive list items
  html = html.replace(/<\/ul>\n<ul>/g, '\n');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.*)$/gm, '<ol><li><p>$1</p></li></ol>');
  html = html.replace(/<\/ol>\n<ol>/g, '\n');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs - wrap remaining lines
  const lines = html.split('\n');
  const wrappedLines = lines.map((line) => {
    if (
      line.trim() === '' ||
      line.startsWith('<h') ||
      line.startsWith('<ul') ||
      line.startsWith('<ol') ||
      line.startsWith('<li') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<pre') ||
      line.startsWith('<hr') ||
      line.startsWith('</') ||
      line.includes('</li>') ||
      line.includes('</ul>') ||
      line.includes('</ol>') ||
      line.includes('</blockquote>')
    ) {
      return line;
    }
    return `<p>${line}</p>`;
  });

  return wrappedLines.join('\n');
}

export function htmlToMarkdown(html: string): string {
  let md = html;

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

  // Bold and italic
  md = md.replace(/<strong><em>(.*?)<\/em><\/strong>/gi, '***$1***');
  md = md.replace(/<em><strong>(.*?)<\/strong><\/em>/gi, '***$1***');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Strikethrough
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');

  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```$1\n$2\n```\n');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');

  // Inline code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const clean = content.replace(/<\/?p[^>]*>/gi, '').trim();
    return clean.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n';
  });

  // Task lists
  md = md.replace(/<li[^>]*data-checked="true"[^>]*>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/li>/gi, '- [x] $1\n');
  md = md.replace(/<li[^>]*data-checked="false"[^>]*>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/li>/gi, '- [ ] $1\n');

  // Regular lists - handle nested content
  md = md.replace(/<li[^>]*><p>(.*?)<\/p><\/li>/gi, '- $1\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Remove list wrappers
  md = md.replace(/<\/?ul[^>]*>/gi, '');
  md = md.replace(/<\/?ol[^>]*>/gi, '');

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Line breaks
  md = md.replace(/<br[^>]*\/?>/gi, '\n');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&quot;/g, '"');

  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}


