import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, useRef } from 'react';
import { markdownToHtml, htmlToMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { createSlashSuggestion } from '@/lib/slashCommandExtension';

interface EditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onEditorReady?: (editor: Editor) => void;
  className?: string;
}

export function ScribbleEditor({ content, onChange, onEditorReady, className }: EditorProps) {
  const slashCleanupRef = useRef<(() => void) | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading...';
          }
          return "Start writing your thoughts...";
        },
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-hover)] cursor-pointer transition-colors',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg prose-slate max-w-none focus:outline-none min-h-[60vh]',
          'prose-headings:font-[var(--font-heading)] prose-headings:font-semibold prose-headings:text-[var(--color-text)]',
          'prose-h1:text-4xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mb-4 prose-h3:text-xl prose-h3:mb-3',
          'prose-p:my-4 prose-p:text-[var(--color-text)] prose-p:leading-[1.8]',
          'prose-ul:my-4 prose-ol:my-4 prose-li:my-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-muted)] prose-blockquote:bg-[var(--color-primary)]/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic',
          'prose-code:bg-[var(--color-text)]/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[var(--color-text)] prose-code:font-mono prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-[var(--color-text)]/5 prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:rounded-lg',
          'prose-a:text-[var(--color-primary)] prose-a:font-medium',
          'prose-strong:text-[var(--color-text)] prose-strong:font-semibold',
          'prose-hr:border-[var(--color-border)] prose-hr:my-8',
          '[&_*::selection]:bg-[var(--color-primary)]/20'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // Update editor content when external content changes
  useEffect(() => {
    if (editor && content) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML());
      if (currentMarkdown !== content) {
        editor.commands.setContent(markdownToHtml(content));
      }
    }
  }, [content, editor]);

  // Set up slash command suggestion
  useEffect(() => {
    if (editor) {
      slashCleanupRef.current = createSlashSuggestion(editor);
    }
    
    return () => {
      if (slashCleanupRef.current) {
        slashCleanupRef.current();
      }
    };
  }, [editor]);

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
