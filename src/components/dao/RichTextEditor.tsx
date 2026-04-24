'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Type,
  Palette,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  height?: string;
  previewMode?: 'split' | 'tab' | 'none';
  onFileUpload?: (files: FileList) => void;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton = ({ icon, label, onClick, isActive, disabled }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
      isActive && "bg-accent"
    )}
    title={label}
  >
    {icon}
  </button>
);

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  maxLength,
  className,
  height = '400px',
  previewMode = 'none',
  onFileUpload
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text formatting functions
  const insertText = (text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + text + selectedText + value.substring(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const wrapText = (before: string, after: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length + selectedText.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatText = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = selectedText;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'heading1':
        formattedText = `# ${selectedText}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'orderedList':
        formattedText = `1. ${selectedText}`;
        break;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      insertText(`[${url}](${url})`);
    }
  };

  // Insert image
  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onFileUpload) {
      onFileUpload(files);
    }
  };

  // History management
  const saveToHistory = () => {
    const newHistory = [...history.slice(0, 50), value];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            formatText('bold');
            break;
          case 'i':
            event.preventDefault();
            formatText('italic');
            break;
          case 'u':
            event.preventDefault();
            formatText('underline');
            break;
          case 'k':
            event.preventDefault();
            insertLink();
            break;
          case 'z':
            event.preventDefault();
            undo();
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
        }
      }
    };

    const textarea = editorRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [value, history, historyIndex]);

  // Save to history on change
  useEffect(() => {
    if (historyIndex === history.length - 1) {
      saveToHistory();
    }
  }, [value]);

  // Markdown preview
  const renderMarkdown = (text: string) => {
    // Simple markdown parser (in production, use a proper markdown library)
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<ul class="list-disc pl-6 mb-2"><li>$1</li></ul>')
      .replace(/^\d+\. (.*$)/gim, '<ol class="list-decimal pl-6 mb-2"><li>$1</li></ol>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
      .replace(/\n/g, '<br />');
  };

  const currentLength = value.length;
  const maxLengthWarning = maxLength && currentLength > maxLength * 0.9;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b bg-muted p-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton
                icon={<Bold className="w-4 h-4" />}
                label="Bold (Ctrl+B)"
                onClick={() => formatText('bold')}
              />
              <ToolbarButton
                icon={<Italic className="w-4 h-4" />}
                label="Italic (Ctrl+I)"
                onClick={() => formatText('italic')}
              />
              <ToolbarButton
                icon={<Underline className="w-4 h-4" />}
                label="Underline (Ctrl+U)"
                onClick={() => formatText('underline')}
              />
              <ToolbarButton
                icon={<Code className="w-4 h-4" />}
                label="Code"
                onClick={() => formatText('code')}
              />
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton
                icon={<Heading1 className="w-4 h-4" />}
                label="Heading 1"
                onClick={() => formatText('heading1')}
              />
              <ToolbarButton
                icon={<Heading2 className="w-4 h-4" />}
                label="Heading 2"
                onClick={() => formatText('heading2')}
              />
              <ToolbarButton
                icon={<Heading3 className="w-4 h-4" />}
                label="Heading 3"
                onClick={() => formatText('heading3')}
              />
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton
                icon={<List className="w-4 h-4" />}
                label="Bullet List"
                onClick={() => formatText('list')}
              />
              <ToolbarButton
                icon={<ListOrdered className="w-4 h-4" />}
                label="Numbered List"
                onClick={() => formatText('orderedList')}
              />
            </div>

            {/* Quote */}
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton
                icon={<Quote className="w-4 h-4" />}
                label="Quote"
                onClick={() => formatText('quote')}
              />
            </div>

            {/* Insert */}
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton
                icon={<Link className="w-4 h-4" />}
                label="Insert Link (Ctrl+K)"
                onClick={insertLink}
              />
              <ToolbarButton
                icon={<Image className="w-4 h-4" />}
                label="Insert Image"
                onClick={insertImage}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* History */}
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton
                icon={<Type className="w-4 h-4" />}
                label="Undo (Ctrl+Z)"
                onClick={undo}
                disabled={historyIndex <= 0}
              />
              <ToolbarButton
                icon={<Type className="w-4 h-4" />}
                label="Redo (Ctrl+Y)"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              />
            </div>

            {/* View Options */}
            <div className="flex items-center gap-1 ml-auto">
              {previewMode !== 'none' && (
                <ToolbarButton
                  icon={isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  label={isPreview ? "Edit" : "Preview"}
                  onClick={() => setIsPreview(!isPreview)}
                />
              )}
              <ToolbarButton
                icon={<Palette className="w-4 h-4" />}
                label="Toggle Toolbar"
                onClick={() => setShowToolbar(!showToolbar)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex" style={{ height }}>
        {previewMode === 'split' ? (
          <>
            {/* Editor */}
            <div className="w-1/2 border-r">
              <textarea
                ref={editorRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-4 resize-none focus:outline-none"
                style={{ height }}
              />
              {maxLength && (
                <div className="px-4 pb-2 text-xs text-muted-foreground">
                  {currentLength}/{maxLength} characters
                  {maxLengthWarning && (
                    <span className="text-orange-500 ml-2">Approaching limit</span>
                  )}
                  {isAtLimit && (
                    <span className="text-red-500 ml-2">At limit</span>
                  )}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="w-1/2 p-4 overflow-y-auto bg-background">
              <div 
                className="prose prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            </div>
          </>
        ) : previewMode === 'tab' ? (
          <>
            {/* Tab Headers */}
            <div className="border-b bg-muted">
              <div className="flex">
                <button
                  className={cn(
                    "px-4 py-2 border-b-2 transition-colors",
                    !isPreview && "border-primary text-primary"
                  )}
                  onClick={() => setIsPreview(false)}
                >
                  Edit
                </button>
                <button
                  className={cn(
                    "px-4 py-2 border-b-2 transition-colors",
                    isPreview && "border-primary text-primary"
                  )}
                  onClick={() => setIsPreview(true)}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Content */}
            {isPreview ? (
              <div className="p-4 overflow-y-auto bg-background">
                <div 
                  className="prose prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
              </div>
            ) : (
              <textarea
                ref={editorRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 resize-none focus:outline-none"
                style={{ height }}
              />
            )}
          </>
        ) : (
          <textarea
            ref={editorRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 resize-none focus:outline-none"
            style={{ height }}
          />
        )}
      </div>

      {/* Character Count */}
      {maxLength && previewMode === 'none' && (
        <div className="px-4 pb-2 text-xs text-muted-foreground border-t">
          {currentLength}/{maxLength} characters
          {maxLengthWarning && (
            <span className="text-orange-500 ml-2">Approaching limit</span>
          )}
          {isAtLimit && (
            <span className="text-red-500 ml-2">At limit</span>
          )}
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
