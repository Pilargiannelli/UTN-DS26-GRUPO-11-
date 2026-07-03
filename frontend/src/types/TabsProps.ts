interface TabItem {
  label: string;
  component: React.ReactNode;
}

interface DesplazadorTabsProps {
  tabs: TabItem[];
}

export type { TabItem, DesplazadorTabsProps };