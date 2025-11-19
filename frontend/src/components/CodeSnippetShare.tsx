import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';

interface CodeSnippetShareProps {
  onInsertSnippet: (code: string, language: string) => void;
}

const CodeSnippetShare: React.FC<CodeSnippetShareProps> = ({ onInsertSnippet }) => {
  const { actualTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'csharp', label: 'C#', icon: '💜' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'sql', label: 'SQL', icon: '🗄️' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'bash', label: 'Bash', icon: '💻' },
    { value: 'json', label: 'JSON', icon: '📦' },
    { value: 'yaml', label: 'YAML', icon: '📄' },
    { value: 'markdown', label: 'Markdown', icon: '📝' },
  ];

  const exampleSnippets = [
    {
      title: 'React Component',
      language: 'jsx',
      code: `import React from 'react';

const MyComponent = ({ title }) => {
  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;`,
    },
    {
      title: 'API Fetch',
      language: 'javascript',
      code: `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`,
    },
    {
      title: 'SQL Query',
      language: 'sql',
      code: `SELECT
  users.name,
  COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id
HAVING order_count > 5
ORDER BY order_count DESC;`,
    },
  ];

  const handleInsert = () => {
    if (code.trim()) {
      const formattedSnippet = `\`\`\`${language}\n${code}\n\`\`\``;
      onInsertSnippet(formattedSnippet, language);
      setCode('');
      setTitle('');
      setIsOpen(false);
    }
  };

  const loadExample = (snippet: typeof exampleSnippets[0]) => {
    setTitle(snippet.title);
    setLanguage(snippet.language);
    setCode(snippet.code);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-label="Share code snippet"
        title="Share code snippet"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Code
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Code Snippet</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Close code snippet editor"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., User Authentication Function"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programming Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm dark:bg-gray-700 dark:text-white"
                  rows={15}
                  spellCheck={false}
                />
              </div>

              {/* Example Snippets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Examples
                </label>
                <div className="flex flex-wrap gap-2">
                  {exampleSnippets.map((snippet, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadExample(snippet)}
                      className="px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                    >
                      {snippet.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {code ? (
                    <div>
                      {title && (
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {title}
                          </span>
                        </div>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                          }}
                          className="absolute top-2 right-2 p-2 bg-gray-700 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                          title="Copy code"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <SyntaxHighlighter
                          language={language}
                          style={actualTheme === 'dark' ? vscDarkPlus : vs}
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            maxHeight: '500px',
                          }}
                          showLineNumbers
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <p className="text-sm">Paste code to see preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Tips</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Code will be syntax-highlighted in the message</li>
                  <li>• Recipients can copy code with one click</li>
                  <li>• Great for technical interviews and code reviews</li>
                  <li>• Supports 17+ programming languages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {code.split('\n').length} lines • {code.length} characters
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!code.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert Snippet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetShare;
