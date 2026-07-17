import React, { useState } from 'react';
import { Cpu, User, Copy, Check } from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button className="copy-code-btn" onClick={handleCopy}>
      {copied ? (
        <>
          <Check size={14} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const MessageBubble = ({ message }) => {
  const { role, content } = message;
  const isAssistant = role === 'assistant';

  // Parse markdown content to identify code blocks vs text blocks
  const parseMarkdown = (text) => {
    if (!text) return [];

    // Split by code blocks using regex
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : 'code';
        const code = match ? match[2] : part.slice(3, -3);
        return {
          type: 'code',
          language: language || 'code',
          content: code.trim(),
          key: index,
        };
      } else {
        return {
          type: 'text',
          content: part,
          key: index,
        };
      }
    });
  };

  // Process text for bold, italics, lists, inline code
  const renderTextWithFormatting = (text, parentKey) => {
    // Replace HTML brackets to prevent injection issues, then parse custom formatting
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code `code`
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    const lines = formatted.split('\n');
    const finalElements = [];
    let listBuffer = [];
    let listType = null; // 'ul' or 'ol'

    const flushList = (key) => {
      if (listBuffer.length > 0) {
        const ListTag = listType;
        finalElements.push(
          <ListTag key={`list-${key}`} style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            {[...listBuffer]}
          </ListTag>
        );
        listBuffer = [];
        listType = null;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const isNumbered = /^\d+\.\s/.test(trimmed);

      if (isBullet) {
        flushList(idx);
        listType = 'ul';
        const content = trimmed.replace(/^[-*]\s/, '');
        listBuffer.push(<li key={`li-${idx}`} dangerouslySetInnerHTML={{ __html: content }} />);
      } else if (isNumbered) {
        flushList(idx);
        listType = 'ol';
        const content = trimmed.replace(/^\d+\.\s/, '');
        listBuffer.push(<li key={`li-${idx}`} dangerouslySetInnerHTML={{ __html: content }} />);
      } else {
        flushList(idx);
        if (trimmed) {
          finalElements.push(
            <p key={`p-${parentKey}-${idx}`} dangerouslySetInnerHTML={{ __html: line }} style={{ marginBottom: '0.75rem' }} />
          );
        }
      }
    });

    flushList(lines.length);
    return finalElements;
  };

  const blocks = parseMarkdown(content);

  return (
    <div className={`message-wrapper ${role}`}>
      <div className={`avatar ${role}`}>
        {isAssistant ? <Cpu size={20} color="white" /> : <User size={20} color="white" />}
      </div>
      <div className="message-bubble">
        <div className="markdown-content">
          {blocks.map((block) => {
            if (block.type === 'code') {
              return (
                <div key={block.key} className="code-block-container">
                  <div className="code-block-header">
                    <span>{block.language.toLowerCase()}</span>
                    <CopyButton text={block.content} />
                  </div>
                  <pre>
                    <code>{block.content}</code>
                  </pre>
                </div>
              );
            } else {
              return renderTextWithFormatting(block.content, block.key);
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
