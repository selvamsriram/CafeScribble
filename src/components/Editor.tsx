import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useEffect } from 'react';
import { markdownToHtml, htmlToMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onEditorReady?: (editor: Editor) => void;
  className?: string;
}

// Extracted prose class configuration for maintainability
const EDITOR_PROSE_CLASSES = [
  // Base prose configuration
  'prose prose-lg prose-slate max-w-none focus:outline-none min-h-[60vh]',
  // Headings
  'prose-headings:font-[var(--font-heading)] prose-headings:font-semibold prose-headings:text-[var(--color-text)]',
  'prose-h1:text-4xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mb-3 prose-h3:text-xl prose-h3:mb-2',
  // Paragraphs with reduced line spacing
  'prose-p:my-2 prose-p:text-[var(--color-text)] prose-p:leading-[1.6]',
  // Lists with reduced spacing and proper marker colors
  'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
  '[&_ul>li]:marker:text-[var(--color-text)] [&_ol>li]:marker:text-[var(--color-text)] [&_ol>li]:marker:font-medium',
  // Blockquotes - styled without quotation marks
  'prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-muted)] prose-blockquote:bg-[var(--color-primary)]/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:before:content-none prose-blockquote:after:content-none',
  // Inline code - subtle, bordered appearance
  'prose-code:bg-[var(--color-surface)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[var(--color-text)] prose-code:font-mono prose-code:text-[0.9em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-code:border prose-code:border-[var(--color-border)]',
  // Code blocks - distinct, prominent appearance
  'prose-pre:bg-[var(--color-surface)] prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:rounded-xl prose-pre:p-4 prose-pre:shadow-sm prose-pre:shadow-[var(--color-shadow)]',
  // Reset code styling inside pre blocks
  '[&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:p-0 [&_pre_code]:shadow-none',
  // Links
  'prose-a:text-[var(--color-primary)] prose-a:font-medium',
  // Strong/bold text
  'prose-strong:text-[var(--color-text)] prose-strong:font-semibold',
  // Horizontal rules
  'prose-hr:border-[var(--color-border)] prose-hr:my-6',
  // Selection highlight
  '[&_*::selection]:bg-[var(--color-primary)]/20'
].join(' ');

export function ScribbleEditor({ content, onChange, onEditorReady, className }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Configure inline code styling
        code: {
          HTMLAttributes: {
            class: 'inline-code',
          },
        },
        // Configure code block styling
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block',
          },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading';
          }
          return 'Write something, or type "/" for commands...';
        },
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--color-primary)] underline underline-offset-4',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: cn(EDITOR_PROSE_CLASSES),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== htmlToMarkdown(editor.getHTML())) {
      editor.commands.setContent(markdownToHtml(content));
    }
  }, [content, editor]);

  return (
    <div className={cn('scribble-editor', className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
