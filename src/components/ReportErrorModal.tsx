import { useCallback } from "react";
import { Linking } from "react-native";
import ShakeModal from "./ShakeModal";
import { APP_VERSION } from "../constants/Version";

const REPORT_URL = "https://github.com/prjctimg/learn-p5/issues/new";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  route: string;
  context?: string;
}

export default function ReportErrorModal({ visible, onDismiss, route, context }: Props) {
  const handleReport = useCallback(() => {
    onDismiss();
    const title = `[Bug] ${APP_VERSION} — ${route}`;
    const body = [
      "**What happened?**",
      "",
      "",
      "**What did you expect to happen?**",
      "",
      "",
      "**Steps to reproduce**",
      "1.",
      "2.",
      "3.",
      "",
      "---",
      `- App version: ${APP_VERSION}`,
      `- Route: ${route}`,
      context ? `- Context: ${context}` : "",
      "",
    ].join("\n");
    const url = `${REPORT_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => {});
  }, [onDismiss, route, context]);

  return (
    <ShakeModal
      visible={visible}
      onDismiss={onDismiss}
      title="Report an Error"
      subtitle="Shake detected — would you like to report a problem?"
      actions={[
        {
          icon: "bug-outline",
          label: "Report Error",
          variant: "primary",
          onPress: handleReport,
        },
        {
          icon: "close",
          label: "Dismiss",
          variant: "ghost",
          onPress: onDismiss,
        },
      ]}
    />
  );
}
