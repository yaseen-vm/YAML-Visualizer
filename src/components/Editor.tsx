import { useRef, useCallback, useMemo } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => {
    const lines = value.split('\n').length;
    return Math.max(lines, 20);
  }, [value]);

  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const lineNumbers = textarea?.previousElementSibling as HTMLElement | null;
    if (textarea && lineNumbers) {
      lineNumbers.scrollTop = textarea.scrollTop;
    }
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Bar */}
      <div className="editor-tab-bar">
        <div className="editor-dots" aria-hidden="true">
          <div className="editor-dot editor-dot--close" />
          <div className="editor-dot editor-dot--minimize" />
          <div className="editor-dot editor-dot--maximize" />
        </div>
        <div className="editor-filename">
          <span className="editor-filename-icon">⬡</span>
          docker-compose.yml
        </div>
      </div>

      {/* Editor Body */}
      <div className="editor-body">
        <div className="editor-line-numbers" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={"# Paste your docker-compose.yml here\n# The graph updates in real-time"}
          spellCheck={false}
          aria-label="Docker Compose YAML editor"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}
