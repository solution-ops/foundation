import type { Icon } from "@phosphor-icons/react";
import { ChartLineIcon, TrashIcon } from "@phosphor-icons/react";

export type NavItem = {
  title: string;
  icon: Icon;
  to: string;
};

export type NavGroup = {
  label: string;
  items: Array<NavItem>;
};

export const navGroups: Array<NavGroup> = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", icon: ChartLineIcon, to: "/dashboard" },
      { title: "Trash", icon: TrashIcon, to: "/trash" },
    ],
  },
];
