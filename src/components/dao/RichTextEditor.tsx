'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Heading3,
  Save,
  RotateCcw,
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
  autoSaveKey?: string;
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
  onFileUpload,
  autoSaveKey = 'dao-proposal-draft',
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auto-save to localStorage ──────────────────────────────────────
  useEffect(() => {
    if (!autoSaveKey) return;
    const timer = setTimeout(() => {
      if (value.trim()) {
        localStorage.setItem(autoSaveKey, JSON.stringify({
          content: value,
          timestamp: Date.now(),
        }));
        setShowDraftNotice(true);
        setTimeout(() => setShowDraftNotice(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [value, autoSaveKey]);

  // Load draft on mount
  useEffect(() => {
    if (!autoSaveKey || value) return;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const { content, timestamp } = JSON.parse(saved);
        const hoursSinceSave = (Date.now() - timestamp) / 3600000;
        if (hoursSinceSave < 72 && content) {
          onChange(content);
        }
      } catch {}
    }
  }, [autoSaveKey]);

  const clearDraft = () => {
    localStorage.removeItem(autoSaveKey);
    setShowDraftNotice(false);
  };

  // Text formatting functions
  const insertText = useCallback((text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  const formatText = useCallback((format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let formattedText = selectedText;
    switch (format) {
      case 'bold': formattedText = `**${selectedText}**`; break;
      case 'italic': formattedText = `*${selectedText}*`; break;
      case 'underline': formattedText = `__${selectedText}__`; break;
      case 'code': formattedText = `\`${selectedText}\``; break;
      case 'heading1': formattedText = `# ${selectedText}`; break;
      case 'heading2': formattedText = `## ${selectedText}`; break;
      case 'heading3': formattedText = `### ${selectedText}`; break;
      case 'quote': formattedText = `> ${selectedText}`; break;
      case 'list': formattedText = `- ${selectedText}`; break;
      case 'orderedList': formattedText = `1. ${selectedText}`; break;
    }
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  }, [value, onChange]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) insertText(`[${url}](${url})`);
  }, [insertText]);

  const insertImage = () => fileInputRef.current?.click();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onFileUpload) {
      onFileUpload(files);
      Array.from(files).forEach(file => {
        const placeholder = file.type.startsWith('image/')
          ? `![${file.name}](uploading...)`
          : `[${file.name}](uploading...)`;
        insertText(placeholder);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onFileUpload, insertText]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b': event.preventDefault(); formatText('bold'); break;
          case 'i': event.preventDefault(); formatText('italic'); break;
          case 'u': event.preventDefault(); formatText('underline'); break;
          case 'k': event.preventDefault(); insertLink(); break;
          case 'z': event.preventDefault(); undo(); break;
          case 'y': event.preventDefault(); redo(); break;
          case 's': event.preventDefault(); break; // prevent browser save
        }
      }
    };
    const textarea = editorRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [formatText, insertLink, undo, redo]);

  // History tracking
  useEffect(() => {
    if (historyIndex === history.length - 1 && value !== history[historyIndex]) {
      const newHistory = [...history.slice(-49), value];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [value]);

  // Markdown preview
  const renderMarkdown = (text: string) => {
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
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const maxLengthWarning = maxLength && currentLength > maxLength * 0.9;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Draft notice */}
      {showDraftNotice && (
        <div className="px-4 py-1.5 bg-primary/10 text-primary text-xs flex items-center justify-between">
          <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Draft saved</span>
          <button onClick={clearDraft} className="hover:underline">Clear</button>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b bg-muted p-2">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton icon={<Bold className="w-4 h-4" />} label="Bold (Ctrl+B)" onClick={() => formatText('bold')} />
              <ToolbarButton icon={<Italic className="w-4 h-4" />} label="Italic (Ctrl+I)" onClick={() => formatText('italic')} />
              <ToolbarButton icon={<Underline className="w-4 h-4" />} label="Underline (Ctrl+U)" onClick={() => formatText('underline')} />
              <ToolbarButton icon={<Code className="w-4 h-4" />} label="Code" onClick={() => formatText('code')} />
            </div>
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton icon={<Heading1 className="w-4 h-4" />} label="Heading 1" onClick={() => formatText('heading1')} />
              <ToolbarButton icon={<Heading2 className="w-4 h-4" />} label="Heading 2" onClick={() => formatText('heading2')} />
              <ToolbarButton icon={<Heading3 className="w-4 h-4" />} label="Heading 3" onClick={() => formatText('heading3')} />
            </div>
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton icon={<List className="w-4 h-4" />} label="Bullet List" onClick={() => formatText('list')} />
              <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} label="Numbered List" onClick={() => formatText('orderedList')} />
            </div>
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton icon={<Quote className="w-4 h-4" />} label="Quote" onClick={() => formatText('quote')} />
            </div>
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton icon={<Link className="w-4 h-4" />} label="Insert Link (Ctrl+K)" onClick={insertLink} />
              <ToolbarButton icon={<Image className="w-4 h-4" />} label="Insert Image" onClick={insertImage} />
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="flex items-center gap-1 border-r pr-2">
              <ToolbarButton icon={<RotateCcw className="w-4 h-4" />} label="Undo (Ctrl+Z)" onClick={undo} disabled={historyIndex <= 0} />
              <ToolbarButton icon={<Type className="w-4 h-4" />} label="Redo (Ctrl+Y)" onClick={redo} disabled={historyIndex >= history.length - 1} />
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {previewMode !== 'none' && (
                <ToolbarButton icon={isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} label={isPreview ? "Edit" : "Preview"} onClick={() => setIsPreview(!isPreview)} />
              )}
              <ToolbarButton icon={<Palette className="w-4 h-4" />} label="Toggle Toolbar" onClick={() => setShowToolbar(!showToolbar)} />
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex" style={{ height }}>
        {previewMode === 'split' ? (
          <>
            <div className="w-1/2 border-r">
              <textarea ref={editorRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-full p-4 resize-none focus:outline-none" style={{ height }} />
            </div>
            <div className="w-1/2 p-4 overflow-y-auto bg-background">
              <div className="prose prose max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
            </div>
          </>
        ) : previewMode === 'tab' ? (
          <>
            <div className="border-b bg-muted">
              <div className="flex">
                <button className={cn("px-4 py-2 border-b-2 transition-colors", !isPreview && "border-primary text-primary")} onClick={() => setIsPreview(false)}>Edit</button>
                <button className={cn("px-4 py-2 border-b-2 transition-colors", isPreview && "border-primary text-primary")} onClick={() => setIsPreview(true)}>Preview</button>
              </div>
            </div>
            {isPreview ? (
              <div className="p-4 overflow-y-auto bg-background">
                <div className="prose prose max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
              </div>
            ) : (
              <textarea ref={editorRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full p-4 resize-none focus:outline-none" style={{ height }} />
            )}
          </>
        ) : (
          <textarea ref={editorRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full p-4 resize-none focus:outline-none" style={{ height }} />
        )}
      </div>

      {/* Character & Word Count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-t flex items-center justify-between">
        <span>{currentLength}{maxLength ? `/${maxLength}` : ''} characters · {wordCount} words</span>
        {maxLengthWarning && <span className="text-orange-500">Approaching limit</span>}
        {isAtLimit && <span className="text-red-500">At limit</span>}
      </div>
    </div>
  );
}

export default RichTextEditor;