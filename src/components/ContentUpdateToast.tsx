import { useEffect, useState } from "react";
import Toast from "./Toast";
import { useContent } from "../contexts/ContentContext";

export default function ContentUpdateToast() {
  const { updatedVersion, dismissUpdate } = useContent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!updatedVersion);
  }, [updatedVersion]);

  if (!updatedVersion) return null;

  return (
    <Toast
      visible={visible}
      message="Course content updated"
      icon="download-circle"
      duration={4000}
      onDismiss={() => {
        setVisible(false);
        dismissUpdate();
      }}
    />
  );
}
