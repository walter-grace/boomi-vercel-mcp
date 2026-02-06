"use client";

import { exampleSetup } from "prosemirror-example-setup";
import { inputRules } from "prosemirror-inputrules";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { memo, useEffect, useRef } from "react";

import type { Suggestion } from "@/lib/db/schema";
import {
  documentSchema,
  handleTransaction,
  headingRule,
} from "@/lib/editor/config";
import {
  buildContentFromDocument,
  buildDocumentFromContent,
  createDecorations,
} from "@/lib/editor/functions";
import {
  projectWithPositions,
  suggestionsPlugin,
  suggestionsPluginKey,
} from "@/lib/editor/suggestions";

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Suggestion[];
};

function PureEditor({
  content,
  onSaveContent,
  suggestions,
  status,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const initializedWithContent = useRef(false);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const initialContent = content || "";
      initializedWithContent.current = !!initialContent.trim();
      
      const state = EditorState.create({
        doc: buildDocumentFromContent(initialContent),
        plugins: [
          ...exampleSetup({ schema: documentSchema, menuBar: false }),
          inputRules({
            rules: [
              headingRule(1),
              headingRule(2),
              headingRule(3),
              headingRule(4),
              headingRule(5),
              headingRule(6),
            ],
          }),
          suggestionsPlugin,
        ],
      });

      editorRef.current = new EditorView(containerRef.current, {
        state,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
        initializedWithContent.current = false;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  // Force re-initialization if content loads after editor was created empty
  useEffect(() => {
    if (
      editorRef.current &&
      containerRef.current &&
      content &&
      content.trim() &&
      !initializedWithContent.current
    ) {
      // Destroy and recreate editor with content
      editorRef.current.destroy();
      editorRef.current = null;

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (containerRef.current) {
          const state = EditorState.create({
            doc: buildDocumentFromContent(content),
            plugins: [
              ...exampleSetup({ schema: documentSchema, menuBar: false }),
              inputRules({
                rules: [
                  headingRule(1),
                  headingRule(2),
                  headingRule(3),
                  headingRule(4),
                  headingRule(5),
                  headingRule(6),
                ],
              }),
              suggestionsPlugin,
            ],
          });

          editorRef.current = new EditorView(containerRef.current, {
            state,
          });
          initializedWithContent.current = true;
        }
      }, 0);
    }
  }, [content]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setProps({
        dispatchTransaction: (transaction) => {
          handleTransaction({
            transaction,
            editorRef,
            onSaveContent,
          });
        },
      });
    }
  }, [onSaveContent]);

  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      const currentContent = buildContentFromDocument(
        editorRef.current.state.doc
      );

      // Normalize both contents for comparison (trim whitespace)
      const normalizedCurrent = currentContent.trim();
      const normalizedNew = (content || "").trim();


      // Check if editor was initialized empty but now we have content
      const wasEmptyAndNowHasContent = 
        !initializedWithContent.current && normalizedNew;

      // Always update if content is provided and different
      // Or if editor is empty/whitespace and we have actual content
      const shouldUpdate = 
        normalizedNew && 
        (normalizedCurrent !== normalizedNew || 
         (!normalizedCurrent && normalizedNew) ||
         wasEmptyAndNowHasContent);

      if (status === "streaming" && content) {
        const newDocument = buildDocumentFromContent(content);

        const transaction = editorRef.current.state.tr.replaceWith(
          0,
          editorRef.current.state.doc.content.size,
          newDocument.content
        );

        transaction.setMeta("no-save", true);
        editorRef.current.dispatch(transaction);
        initializedWithContent.current = true;
        return;
      }

      if (shouldUpdate) {
        try {
          const newDocument = buildDocumentFromContent(content);

          // Always use replaceWith transaction - it's more reliable
          const docSize = editorRef.current.state.doc.content.size;
          const transaction = editorRef.current.state.tr.replaceWith(
            0,
            docSize,
            newDocument.content
          );

          transaction.setMeta("no-save", true);
          editorRef.current.dispatch(transaction);
          initializedWithContent.current = true;
        } catch (error) {
          console.error("Error updating editor content:", error);
          // Fallback: try to recreate the editor
          if (containerRef.current && editorRef.current) {
            editorRef.current.destroy();
            editorRef.current = null;
            
            const state = EditorState.create({
              doc: buildDocumentFromContent(content),
              plugins: [
                ...exampleSetup({ schema: documentSchema, menuBar: false }),
                inputRules({
                  rules: [
                    headingRule(1),
                    headingRule(2),
                    headingRule(3),
                    headingRule(4),
                    headingRule(5),
                    headingRule(6),
                  ],
                }),
                suggestionsPlugin,
              ],
            });

            editorRef.current = new EditorView(containerRef.current, {
              state,
            });
            initializedWithContent.current = true;
          }
        }
      }
    }
  }, [content, status]);

  useEffect(() => {
    if (editorRef.current?.state.doc && content) {
      const projectedSuggestions = projectWithPositions(
        editorRef.current.state.doc,
        suggestions
      ).filter(
        (suggestion) => suggestion.selectionStart && suggestion.selectionEnd
      );

      const decorations = createDecorations(
        projectedSuggestions,
        editorRef.current
      );

      const transaction = editorRef.current.state.tr;
      transaction.setMeta(suggestionsPluginKey, { decorations });
      editorRef.current.dispatch(transaction);
    }
  }, [suggestions, content]);

  return (
    <div className="prose dark:prose-invert relative" ref={containerRef} />
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  // Always re-render if content changes (even if string reference is same, content might have loaded)
  if (prevProps.content !== nextProps.content) {
    return false;
  }
  
  return (
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === "streaming" && nextProps.status === "streaming") &&
    prevProps.onSaveContent === nextProps.onSaveContent
  );
}

export const Editor = memo(PureEditor, areEqual);
