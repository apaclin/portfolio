import type { FlowData } from '../types';

// Пример: «Традиционный AP» — верхний горизонтальный флоу.
// Счёт → сверка → расхождение → развилка наружу (команда / Slack / email).
export const traditionalAp: FlowData = {
  title: { en: 'Traditional AP', ru: 'Традиционный АР' },
  direction: 'horizontal',
  nodes: [
    {
      id: 'invoice',
      icon: 'receipt',
      label: { en: 'Invoice arrives', ru: 'Поступает счёт' },
      variant: 'active',
    },
    {
      id: 'match',
      icon: 'share',
      label: { en: 'Document check', ru: 'Сверка документов' },
      variant: 'default',
    },
    {
      id: 'disc',
      icon: 'alert-triangle',
      label: { en: 'Discrepancy found', ru: 'Расхождение обнаружено' },
      variant: 'warning',
    },
    {
      id: 'team',
      icon: 'users',
      label: { en: 'Team', ru: 'Команда' },
      variant: 'default',
    },
    {
      id: 'slack',
      icon: 'slack',
      label: { en: 'Slack', ru: 'Slack' },
      variant: 'default',
    },
    {
      id: 'email',
      icon: 'mail',
      label: { en: 'Email', ru: 'Email' },
      variant: 'default',
    },
  ],
  edges: [
    { from: 'invoice', to: 'match' },
    { from: 'match', to: 'disc' },
    {
      from: 'disc',
      to: ['team', 'slack', 'email'],
      caption: {
        en: 'Communication goes external',
        ru: 'Коммуникация уходит наружу',
      },
    },
  ],
};
