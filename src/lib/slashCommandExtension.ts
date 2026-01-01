import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SlashMenu, type SlashMenuRef, getSlashCommands, filterCommands, type SlashCommand } from '@/components/SlashMenu';

// Create the suggestion plugin for slash commands
export function createSlashSuggestion(editor: any) {
  let popup: any = null;
  let component: ReactRenderer | null = null;
  let query = '';
  let isOpen = false;
  let startPos = 0;

  const updateMenu = () => {
    if (!component) return;
    const commands = getSlashCommands(editor);
    const filtered = filterCommands(commands, query);
    component.updateProps({ items: filtered });
  };

  const show = (pos: number) => {
    if (isOpen) return;
    
    isOpen = true;
    startPos = pos;
    query = '';

    const commands = getSlashCommands(editor);

    component = new ReactRenderer(SlashMenu, {
      props: {
        items: commands,
        command: (item: SlashCommand) => {
          // Delete the slash and query
          const { from } = editor.state.selection;
          const deleteFrom = startPos;
          const deleteTo = from;
          
          editor.chain()
            .focus()
            .deleteRange({ from: deleteFrom, to: deleteTo })
            .run();
          
          // Execute the command
          item.action();
          
          hide();
        },
      },
      editor,
    });

    const { view } = editor;
    const coords = view.coordsAtPos(pos);

    popup = tippy(document.body, {
      getReferenceClientRect: () => {
        const rect = {
          width: 0,
          height: 0,
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          right: coords.left,
          x: coords.left,
          y: coords.top,
        };
        return rect as DOMRect;
      },
      appendTo: () => document.body,
      content: component.element,
      showOnCreate: true,
      interactive: true,
      trigger: 'manual',
      placement: 'bottom-start',
      offset: [0, 8],
    });
  };

  const hide = () => {
    if (!isOpen) return;
    
    isOpen = false;
    query = '';
    
    popup?.destroy();
    popup = null;
    
    component?.destroy();
    component = null;
  };

  const handleKeyDown = (event: KeyboardEvent): boolean => {
    if (!isOpen) return false;
    
    const ref = component?.ref as SlashMenuRef | null;
    
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hide();
      return true;
    }
    
    // Handle arrow keys and Enter - prevent default to stop editor from handling them
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      
      if (ref?.onKeyDown) {
        ref.onKeyDown(event);
      }
      return true;
    }
    
    return false;
  };

  // Listen for text changes to detect slash commands
  const handleUpdate = () => {
    const { selection, doc } = editor.state;
    const { from } = selection;
    
    // Don't show menu if there's a text selection
    if (!selection.empty) {
      hide();
      return;
    }
    
    // Get text before cursor (up to 100 chars to check for URLs)
    const textBefore = doc.textBetween(Math.max(0, from - 100), from, '\0');
    
    // Find the last slash
    const lastSlashIndex = textBefore.lastIndexOf('/');
    
    if (lastSlashIndex === -1) {
      hide();
      return;
    }
    
    // Check what's before the slash - must be whitespace or start of text
    const charBeforeSlash = lastSlashIndex > 0 ? textBefore.charAt(lastSlashIndex - 1) : '';
    const isValidTriggerPosition = lastSlashIndex === 0 || /\s/.test(charBeforeSlash);
    
    if (!isValidTriggerPosition) {
      // Slash is in the middle of a word (like a URL), ignore it
      hide();
      return;
    }
    
    // Check if we're in a slash command context
    const textAfterSlash = textBefore.slice(lastSlashIndex + 1);
    
    // Only allow alphanumeric characters and no spaces (command query)
    if (/^[a-zA-Z0-9]*$/.test(textAfterSlash)) {
      const slashPos = from - textBefore.length + lastSlashIndex;
      
      if (!isOpen) {
        show(slashPos);
      } else {
        startPos = slashPos;
      }
      
      query = textAfterSlash;
      updateMenu();
    } else {
      hide();
    }
  };

  // Set up listeners
  editor.on('update', handleUpdate);
  editor.on('selectionUpdate', handleUpdate);
  
  // Handle keydown on the editor element
  const editorElement = editor.view.dom;
  editorElement.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    hide();
    editor.off('update', handleUpdate);
    editor.off('selectionUpdate', handleUpdate);
    editorElement.removeEventListener('keydown', handleKeyDown);
  };
}
