import { basicSetup, EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { keymap, ViewPlugin, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxHighlighting, HighlightStyle, syntaxTree } from "@codemirror/language";
import { indentSelection } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";

export {
  basicSetup,
  EditorView,
  EditorState,
  keymap,
  syntaxHighlighting,
  HighlightStyle,
  syntaxTree,
  ViewPlugin,
  Decoration,
  DecorationSet,
  indentSelection,
  javascript,
  tags,
  autocompletion,
  CompletionContext,
};
