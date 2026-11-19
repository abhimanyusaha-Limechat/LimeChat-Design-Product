const SEMANTIC_COLOR_KEYS = ["dark", "light"] as const;

export type SemanticColorKeys = (typeof SEMANTIC_COLOR_KEYS)[number];
