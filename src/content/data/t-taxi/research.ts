export const researchHighlightsRu = {
  title: 'Что показало исследование',
  description:
    'Изучение открытых источников помогло увидеть повторяющиеся закономерности: один оператор ведёт десятки машин, необработанные сигналы быстро превращаются в шум, а рабочее место центра мониторинга держится на трёх опорах — карте, очереди и ключевых метриках.',
  items: [
    {
      title: 'Перегруз сигналами',
      body: 'Главная проблема NOC — не нехватка сигналов, а их избыток. Сырые алерты шумят, дублируются и мешают быстро понять, что действительно важно. Поэтому инженер должен работать не с отдельными сигналами, а с инцидентом как с единицей триажа.',
      imageSrc: '/assets/t-taxi/research/alerts-to-incident.ru.svg',
      imageAlt: 'Схема alerts-to-incident: сырые алерты собираются в один инцидент',
    },
    {
      title: 'Один инженер — десятки машин',
      body: 'В открытых материалах по автономному транспорту встречаются разные соотношения машин на одного оператора:',
      points: [
        'Waymo — около 1:43',
        'Cruise — около 1:15–20',
        'Китайские операторы — около 1:3',
      ],
      conclusion:
        'Для кейса это значит одно: очередь должна выдерживать десятки инцидентов на одного дежурного инженера без лишнего шума.',
      imageSrc: '/assets/t-taxi/research/vehicles-per-engineer.ru.svg',
      imageAlt: 'Схема vehicles-per-engineer: один инженер наблюдает за десятками машин',
      reverse: true,
    },
    {
      title: 'Базовый паттерн Fleet Ops',
      body: 'Для таких систем типовая компоновка — карта, очередь и сводка KPI. Карта нужна для локализации, очередь — для приоритизации, KPI — для общего понимания состояния смены.',
      imageSrc: '/assets/t-taxi/research/fleet-ops-layout.png',
      imageAlt: 'Пример fleet ops layout с картой, очередью и сводкой KPI',
      imageCaption: 'FleetOps',
      imageWidth: 560,
      imageHeight: 350,
    },
    {
      title: 'Критичность и жизненный цикл',
      body: 'В управлении инцидентами важно сразу видеть приоритет и статус. Я использую P1–P4 и жизненный цикл:',
      points: ['новый', 'принят', 'в работе', 'отложен', 'разрешён'],
      pointsVariant: 'numbered',
      imageSrc: '/assets/t-taxi/research/severity-lifecycle.ru.svg',
      imageAlt: 'Схема severity-lifecycle: уровни приоритета и статусы обработки инцидента',
      imageCaption: 'PagerDuty',
      reverse: true,
    },
    {
      title: 'Заряд и доступность флота',
      body: 'Для электрофлота нужен двухуровневый показ SoC (state of charge): на уровне флота — общий донат или тепловая карта, на уровне машины — точный процент заряда и остаточный пробег. Это помогает понять не только проблему одной машины, но и состояние смены целиком.',
      imageSrc: '/assets/t-taxi/research/soc-availability.svg',
      imageAlt: 'Схема soc-availability: заряд и доступность электрофлота',
      imageCaption: 'autoSecure fleet management',
    },
  ],
};

export const researchHighlightsEn = {
  title: 'What the research showed',
  description:
    'Desk research revealed a few recurring patterns: one operator supervises dozens of vehicles, untreated signals quickly turn into noise, and the monitoring-center workstation relies on three anchors: the map, the queue, and key metrics.',
  items: [
    {
      title: 'Signal overload',
      body: 'The main NOC problem is not a lack of signals, but too many of them. Raw alerts create noise, duplicate each other, and make it harder to understand what matters. The engineer should work with an incident as the triage unit, not with individual signals.',
      imageSrc: '/assets/t-taxi/research/alerts-to-incident.en.svg',
      imageAlt: 'Alerts-to-incident diagram: raw alerts are grouped into one incident',
    },
    {
      title: 'One engineer, dozens of vehicles',
      body: 'Public materials on autonomous transport mention different vehicle-to-operator ratios:',
      points: [
        'Waymo: around 1:43',
        'Cruise: around 1:15-20',
        'Chinese operators: around 1:3',
      ],
      conclusion:
        'For this case the takeaway is simple: the queue has to support dozens of incidents per on-duty engineer without extra noise.',
      imageSrc: '/assets/t-taxi/research/vehicles-per-engineer.en.svg',
      imageAlt: 'Vehicles-per-engineer diagram: one engineer monitors dozens of vehicles',
      reverse: true,
    },
    {
      title: 'A basic Fleet Ops pattern',
      body: 'For systems like this, the typical layout is a map, a queue, and a KPI summary. The map supports localization, the queue supports prioritization, and KPIs provide the shift-level picture.',
      imageSrc: '/assets/t-taxi/research/fleet-ops-layout.png',
      imageAlt: 'Fleet ops layout example with a map, queue, and KPI summary',
      imageCaption: 'FleetOps',
      imageWidth: 560,
      imageHeight: 350,
    },
    {
      title: 'Severity and lifecycle',
      body: 'Incident management needs priority and status to be visible immediately. I use P1-P4 and this lifecycle:',
      points: ['new', 'accepted', 'in progress', 'snoozed', 'resolved'],
      pointsVariant: 'numbered',
      imageSrc: '/assets/t-taxi/research/severity-lifecycle.en.svg',
      imageAlt: 'Severity-lifecycle diagram: incident priority levels and handling statuses',
      imageCaption: 'PagerDuty',
      reverse: true,
    },
    {
      title: 'Fleet charge and availability',
      body: 'An electric fleet needs a two-level SoC view: an aggregate donut or heatmap at fleet level, and exact charge percentage and remaining range at vehicle level. That helps the engineer understand both a single-vehicle issue and the state of the shift.',
      imageSrc: '/assets/t-taxi/research/soc-availability.svg',
      imageAlt: 'SoC-availability diagram: charge and availability of an electric fleet',
      imageCaption: 'autoSecure fleet management',
    },
  ],
};

export const researchHighlights = researchHighlightsRu;
