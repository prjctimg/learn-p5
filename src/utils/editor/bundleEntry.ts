import { basicSetup, EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { indentSelection } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { tags } from "@lezer/highlight";

export {
  basicSetup,
  EditorView,
  EditorState,
  keymap,
  syntaxHighlighting,
  HighlightStyle,
  indentSelection,
  javascript,
  tags,
};
