declare module "react-native-webview" {
  import type { ViewProps } from "react-native";
  import type { Component } from "react";

  interface WebViewSourceHtml {
    html: string;
    baseUrl?: string;
  }

  interface WebViewSourceUri {
    uri: string;
    headers?: Record<string, string>;
  }

  interface WebViewNativeEvent {
    nativeEvent: { data: string };
  }

  interface WebViewProps extends ViewProps {
    source: WebViewSourceHtml | WebViewSourceUri;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    originWhitelist?: string[];
    scrollEnabled?: boolean;
    bounces?: boolean;
    allowFileAccess?: boolean;
    onMessage?: (event: WebViewNativeEvent) => void;
    keyboardDisplayRequiresUserAction?: boolean;
    hideKeyboardAccessoryView?: boolean;
    overScrollMode?: "always" | "content" | "never";
  }

  export default class WebView extends Component<WebViewProps> {
    postMessage: (data: string) => void;
  }
}
