import React from "react";
import Popover from "@/components/core/Popover";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { IconMoodSmile } from "@tabler/icons-react";
import type { ActionIconProps } from "@/components/core/ActionIcon";
import ActionIcon from "@/components/core/ActionIcon";
import styles from "@/components/core/EmojiPicker/EmojiPicker.module.sass";

/** Compact panel — fits toolbars without dominating the form. */
const DEFAULT_PICKER_WIDTH = 252;
const DEFAULT_PICKER_HEIGHT = 296;

const pickerThemeVariables = {
  "--epr-picker-border-radius": "var(--mantine-radius-2xs)",
  "--epr-highlight-color": "var(--mantine-color-primary-filled)",
  "--epr-category-icon-active-color": "var(--mantine-color-primary-filled)",
} as React.CSSProperties;

export type AddEmojiProps = {
  onEmojiClick: (emoji: string) => void;
  openEmoji: boolean;
  toggleEmoji: (open: boolean) => void;
  size?: ActionIconProps["size"];
  variant?: ActionIconProps["variant"];
  iconSize?: number;
  pickerWidth?: number;
  pickerHeight?: number;
};

function AddEmoji({
  openEmoji,
  toggleEmoji,
  onEmojiClick,
  size = "sm",
  variant = "subtle",
  iconSize = 16,
  pickerWidth = DEFAULT_PICKER_WIDTH,
  pickerHeight = DEFAULT_PICKER_HEIGHT,
}: AddEmojiProps) {
  return (
    <Popover
      opened={openEmoji}
      position="top-start"
      withArrow
      withinPortal
      classNames={{ dropdown: styles.dropdown ?? "" }}
      onClose={() => toggleEmoji(false)}
    >
      <Popover.Target>
        <ActionIcon
          className={styles.trigger ?? ""}
          size={size}
          variant={variant}
          color="gray"
          onClick={() => toggleEmoji(true)}
        >
          <IconMoodSmile size={iconSize} color="var(--mantine-color-light)" />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <EmojiPicker
          theme={Theme.LIGHT}
          emojiStyle={EmojiStyle.GOOGLE}
          width={pickerWidth}
          height={pickerHeight}
          style={pickerThemeVariables}
          skinTonesDisabled
          autoFocusSearch={false}
          lazyLoadEmojis
          previewConfig={{ showPreview: false }}
          onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)}
        />
      </Popover.Dropdown>
    </Popover>
  );
}

AddEmoji.displayName = "AddEmoji";

export default AddEmoji;
export { AddEmoji as EmojiPicker };
