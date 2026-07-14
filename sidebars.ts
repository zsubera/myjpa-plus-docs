import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Guide',
      items: [
        'getting-started',
        'query-spec',
        'joins',
        'sub-queries',
        'bulk-operations',
        'upsert',
        'cte',
        'soft-delete',
        'encryption',
        'field-masking',
        'audit',
        'myjpa-template',
        'projection',
        'code-generation',
        'code-enum',
        'security',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'api',
        'configuration',
        'architecture',
        'database-compatibility',
        'faq',
      ],
    },
  ],
  apiSidebar: [
    'api',
  ],
};

export default sidebars;
