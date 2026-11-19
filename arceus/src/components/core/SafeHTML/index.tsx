import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import type { Config as DOMPurifyConfig } from "dompurify";

type ElementTag = keyof JSX.IntrinsicElements;

interface SafeHTMLProps extends Omit<React.HTMLAttributes<HTMLElement>, "dangerouslySetInnerHTML"> {
  htmlContent: string;
  sanitizerConfig?: DOMPurifyConfig;
  elementType?: ElementTag;
  customSanitize?: ((content: string) => string) | null;
  style?: React.CSSProperties;
  className?: string;
}

function SafeHTML({
  htmlContent,
  sanitizerConfig = {},
  elementType = "div",
  customSanitize = null,
  style = {},
  className = "",
  ...props
}: SafeHTMLProps): JSX.Element {
  const sanitizedContent = useMemo((): string => {
    let contentToSanitize = htmlContent;

    if (typeof customSanitize === "function") {
      contentToSanitize = customSanitize(contentToSanitize);
    }

    return DOMPurify.sanitize(contentToSanitize, sanitizerConfig);
  }, [htmlContent, sanitizerConfig, customSanitize]);

  return React.createElement(elementType, {
    ...props,
    style,
    className,
    dangerouslySetInnerHTML: { __html: sanitizedContent },
  });
}

export default SafeHTML;
export { SafeHTML };
