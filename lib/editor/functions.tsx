"use client";

import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { DOMParser, type Node } from "prosemirror-model";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

import { documentSchema } from "./config";
import { createSuggestionWidget, type UISuggestion } from "./suggestions";

/**
 * Convert markdown to HTML for ProseMirror parsing.
 * Uses a lightweight converter that covers the nodes supported by
 * the ProseMirror document schema (headings, paragraphs, lists, bold,
 * italic, links, code, blockquotes, horizontal rules).
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) {
    return "<p></p>";
  }

  let html = markdown;

  // Normalize line endings
  html = html.replace(/\r\n/g, "\n");

  // Split into blocks by double newlines
  const blocks = html.split(/\n\n+/);
  const result: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) {
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/m);
    if (headingMatch && trimmed.startsWith("#")) {
      const level = headingMatch[1].length;
      const text = processInline(headingMatch[2]);
      result.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      result.push("<hr>");
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).filter((l) => l.trim());
      const listItems = items
        .map((item) => {
          const text = processInline(item.replace(/^[-*+]\s+/, ""));
          return `<li><p>${text}</p></li>`;
        })
        .join("");
      result.push(`<ul>${listItems}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).filter((l) => l.trim());
      const listItems = items
        .map((item) => {
          const text = processInline(item.replace(/^\d+[.)]\s+/, ""));
          return `<li><p>${text}</p></li>`;
        })
        .join("");
      result.push(`<ol>${listItems}</ol>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const lines = trimmed
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join("\n");
      const inner = markdownToHtml(lines);
      result.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    // Regular paragraph (may contain line breaks)
    const lines = trimmed.split("\n");
    const text = lines.map((l) => processInline(l)).join("<br>");
    result.push(`<p>${text}</p>`);
  }

  return result.join("");
}

/**
 * Process inline markdown: bold, italic, code, links
 */
function processInline(text: string): string {
  let result = text;

  // Inline code (before other formatting to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold + italic
  result = result.replace(
    /\*\*\*(.+?)\*\*\*/g,
    "<strong><em>$1</em></strong>"
  );

  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  return result;
}

export const buildDocumentFromContent = (content: string) => {
  const parser = DOMParser.fromSchema(documentSchema);
  const htmlString = markdownToHtml(content);
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = htmlString;
  return parser.parse(tempContainer);
};

export const buildContentFromDocument = (document: Node) => {
  return defaultMarkdownSerializer.serialize(document);
};

export const createDecorations = (
  suggestions: UISuggestion[],
  view: EditorView
) => {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: "suggestion-highlight",
        },
        {
          suggestionId: suggestion.id,
          type: "highlight",
        }
      )
    );

    decorations.push(
      Decoration.widget(
        suggestion.selectionStart,
        (currentView) => {
          const { dom } = createSuggestionWidget(suggestion, currentView);
          return dom;
        },
        {
          suggestionId: suggestion.id,
          type: "widget",
        }
      )
    );
  }

  return DecorationSet.create(view.state.doc, decorations);
};
