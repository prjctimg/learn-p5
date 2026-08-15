declare module "react-native-webview" {
  import type { ViewProps } from "react-native";

  interface WebViewSourceHtml {
    html: string;
    baseUrl?: string;
  }

  interface WebViewSourceUri {
    uri: string;
    headers?: Record<string, string>;
  }

  interface WebViewErrorEvent {
    nativeEvent: {
      code: number;
      description: string;
      domain?: string;
    };
  }

  interface WebViewMessageEvent {
    nativeEvent: {
      data: string;
    };
  }

  interface WebViewProps extends ViewProps {
    source: WebViewSourceHtml | WebViewSourceUri;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    originWhitelist?: string[];
    scrollEnabled?: boolean;
    bounces?: boolean;
    allowFileAccess?: boolean;
    onError?: (event: WebViewErrorEvent) => void;
    onMessage?: (event: WebViewMessageEvent) => void;
  }

  export class WebView extends React.Component<WebViewProps> {
    postMessage(data: string): void;
  }
}
