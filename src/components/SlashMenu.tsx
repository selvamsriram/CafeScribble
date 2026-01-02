import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Type,
  Pilcrow,
} from 'lucide-react';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
}

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (items.length === 0) return false;
        
        if (event.key === 'ArrowUp') {
          // Don't wrap - stay at 0 if already at top
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          return true;
        }

        if (event.key === 'ArrowDown') {
          // Don't wrap - stay at last if already at bottom
          setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // Scroll selected item into view
    useEffect(() => {
      const selectedEl = itemsRef.current[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, [selectedIndex]);

    if (items.length === 0) {
      return (
        <div className="slash-menu-container bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg shadow-[var(--color-shadow-lg)] p-3 min-w-[280px]">
          <p className="text-sm text-[var(--color-text-muted)] text-center py-2">
            No commands found
          </p>
        </div>
      );
    }

    return (
      <div
        ref={menuRef}
        className="slash-menu-container bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg shadow-[var(--color-shadow-lg)] py-2 min-w-[280px] max-h-[320px] overflow-y-auto"
      >
        <div className="px-3 py-1.5 mb-1">
          <p className="text-[10px] uppercase tracking-wider font-medium text-[var(--color-text-muted)]">
            Commands
          </p>
        </div>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => { itemsRef.current[index] = el; }}
            onClick={() => selectItem(index)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
              index === selectedIndex
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-text)]'
                : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                index === selectedIndex
                  ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                  : 'bg-[var(--color-background)] text-[var(--color-text-muted)]'
              )}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

SlashMenu.displayName = 'SlashMenu';

// Slash commands configuration
export function getSlashCommands(editor: Editor): SlashCommand[] {
  return [
    {
      id: 'text',
      label: 'Text',
      description: 'Plain paragraph text',
      icon: <Pilcrow className="w-4 h-4" />,
      keywords: ['text', 'paragraph', 'p'],
      action: () => editor.chain().focus().setParagraph().run(),
    },
    {
      id: 'heading1',
      label: 'Heading 1',
      description: 'Large section heading',
      icon: <Heading1 className="w-4 h-4" />,
      keywords: ['h1', 'heading', 'title', 'large'],
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'heading2',
      label: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="w-4 h-4" />,
      keywords: ['h2', 'heading', 'subtitle', 'medium'],
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'heading3',
      label: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="w-4 h-4" />,
      keywords: ['h3', 'heading', 'small'],
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: 'bullet',
      label: 'Bullet List',
      description: 'Create a bulleted list',
      icon: <List className="w-4 h-4" />,
      keywords: ['bullet', 'list', 'ul', 'unordered'],
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'numbered',
      label: 'Numbered List',
      description: 'Create a numbered list',
      icon: <ListOrdered className="w-4 h-4" />,
      keywords: ['numbered', 'list', 'ol', 'ordered', '1'],
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'todo',
      label: 'To-do List',
      description: 'Track tasks with checkboxes',
      icon: <CheckSquare className="w-4 h-4" />,
      keywords: ['todo', 'task', 'checkbox', 'check'],
      action: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      id: 'quote',
      label: 'Quote',
      description: 'Add a blockquote',
      icon: <Quote className="w-4 h-4" />,
      keywords: ['quote', 'blockquote', 'citation'],
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'code',
      label: 'Code Block',
      description: 'Add a code snippet',
      icon: <Code className="w-4 h-4" />,
      keywords: ['code', 'codeblock', 'snippet', 'pre'],
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'divider',
      label: 'Divider',
      description: 'Add a horizontal line',
      icon: <Minus className="w-4 h-4" />,
      keywords: ['divider', 'hr', 'line', 'separator'],
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      id: 'bold',
      label: 'Bold',
      description: 'Make text bold',
      icon: <Type className="w-4 h-4 font-bold" />,
      keywords: ['bold', 'strong', 'b'],
      action: () => editor.chain().focus().toggleBold().run(),
    },
  ];
}

// Filter commands based on query
export function filterCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return commands;
  }

  return commands.filter((command) => {
    const matchLabel = command.label.toLowerCase().includes(lowerQuery);
    const matchKeywords = command.keywords.some((keyword) =>
      keyword.toLowerCase().includes(lowerQuery)
    );
    return matchLabel || matchKeywords;
  });
}

