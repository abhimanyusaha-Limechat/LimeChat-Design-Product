/**
 * Product presets for the LimeChat sidebar.
 *
 * Each preset is the nav configuration for one LimeChat product as drawn in
 * the design system (Figma node 8773:1123). `items` fill the middle stack;
 * `footerItems` sit above the avatar. Icon-to-route wiring is left to the
 * consumer — spread a preset and pass your own `selectedId` / `onSelect`.
 *
 *   <Sidebar {...helpdeskSidebar} selectedId="tickets" onSelect={navigate} />
 */
import type { SidebarItem } from './Sidebar';

export type SidebarPreset = {
  items: SidebarItem[];
  footerItems: SidebarItem[];
};

export const helpdeskSidebar: SidebarPreset = {
  items: [
    { id: 'tickets', label: 'Tickets', icon: 'message-circle' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
    { id: 'contacts', label: 'Contacts', icon: 'users' },
    { id: 'templates', label: 'Templates', icon: 'layout' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
  footerItems: [{ id: 'notifications', label: 'Notifications', icon: 'bell' }],
};

export const marketingSidebar: SidebarPreset = {
  items: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'broadcast', label: 'Broadcast', icon: 'speakerphone' },
    { id: 'automation-flows', label: 'Automation flows', icon: 'share' },
    { id: 'templates', label: 'Templates', icon: 'layout' },
    { id: 'segments', label: 'Segments', icon: 'users' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
  footerItems: [
    { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
  ],
};

export const automationSidebar: SidebarPreset = {
  items: [
    { id: 'agents', label: 'Agents', icon: 'headset' },
    { id: 'tasks', label: 'Tasks', icon: 'list-check' },
    { id: 'flows', label: 'Flows', icon: 'share' },
    { id: 'quiz-builder', label: 'Quiz Builder', icon: 'help-circle' },
    { id: 'bot-management', label: 'Bot Management', icon: 'robot' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: 'book' },
    { id: 'ai-evaluations', label: 'AI Evaluations', icon: 'gauge' },
    { id: 'learning-academy', label: 'Learning Academy', icon: 'school' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
  footerItems: [{ id: 'notifications', label: 'Notifications', icon: 'bell' }],
};

export const sidebarPresets = {
  helpdesk: helpdeskSidebar,
  marketing: marketingSidebar,
  automation: automationSidebar,
} as const;

export type SidebarProduct = keyof typeof sidebarPresets;
