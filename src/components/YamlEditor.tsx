import Editor from "@monaco-editor/react";

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
}

export default function YamlEditor({ value, onChange, isDark }: YamlEditorProps) {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden flex flex-col" style={{
      backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-[#2d2d2d]' : 'bg-[#e8e8e8]'}`}>
        <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 cursor-pointer transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 cursor-pointer transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 cursor-pointer transition-colors"></div>
        <span className={`ml-2 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>docker-compose.yml</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="yaml"
          theme={isDark ? "vs-dark" : "vs-light"}
          value={value}
          onChange={(v) => onChange(v || "")}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            minimap: { enabled: false },
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorStyle: "line",
            wordWrap: "on",
            tabSize: 2,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      </div>
    </div>
  );
}
