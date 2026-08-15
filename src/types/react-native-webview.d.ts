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

  interface WebViewProps extends ViewProps {
    source: WebViewSourceHtml | WebViewSourceUri;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    originWhitelist?: string[];
    scrollEnabled?: boolean;
    bounces?: boolean;
    allowFileAccess?: boolean;
  }

  export class WebView extends React.Component<WebViewProps> {}
}
