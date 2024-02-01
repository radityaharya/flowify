import { useState } from "react";

const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return { copied, copyToClipboard };
};

export default useClipboard;
