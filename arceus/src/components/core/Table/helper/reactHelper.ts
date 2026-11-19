/* oxlint-disable import/prefer-default-export */
import { forwardRef, createElement } from "react";
import classNames from "classnames";

type JSXElementProps = {
  className?: string;
  type?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export const createComponent = (name: string, tag: string, predefinedClassNames = "") => {
  const Component = forwardRef(
    (
      {
        className = "",
        type = "text",
        style = {},
        children = null,
        onClick = () => null,
        ...rest
      }: JSXElementProps,
      ref,
    ) =>
      createElement(
        tag,
        {
          ref,
          className: classNames(className, predefinedClassNames),
          style,
          type,
          onClick,
          ...rest,
        },
        children,
      ),
  );

  Component.displayName = name;

  return Component;
};
