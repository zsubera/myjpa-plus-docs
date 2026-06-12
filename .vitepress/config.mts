import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MyJpa-Plus',
  description: 'Type-safe JPA Specification builder with lambda-based fluent API',
  base: '/myjpa-plus-docs/',
  lastUpdated: true,
  cleanUrls: false,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/guide/api' },
          {
            text: 'v1.2.0',
            items: [
              { text: 'Changelog', link: '/changelog' },
              { text: 'Contributing', link: '/contributing' }
            ]
          }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is MyJpa-Plus?', link: '/guide/what-is-myjpa-plus' },
                { text: 'Getting Started', link: '/guide/getting-started' }
              ]
            },
            {
              text: 'Guide',
              items: [
                { text: 'QuerySpec', link: '/guide/query-spec' },
                { text: 'Join Queries', link: '/guide/joins' },
                { text: 'Sub Queries', link: '/guide/sub-queries' },
                { text: 'Update & Delete', link: '/guide/bulk-operations' },
                { text: 'UPSERT / MergeSpec', link: '/guide/upsert' },
                { text: 'CTE', link: '/guide/cte' },
                { text: 'Soft Delete', link: '/guide/soft-delete' },
                { text: 'Encryption', link: '/guide/encryption' },
                { text: 'Audit', link: '/guide/audit' },
                { text: 'MyJpaTemplate', link: '/guide/myjpa-template' },
                { text: 'Projection', link: '/guide/projection' },
                { text: 'Code Generation', link: '/guide/code-generation' }
              ]
            },
            {
              text: 'Reference',
              items: [
                { text: 'API Reference', link: '/guide/api' },
                { text: 'Configuration', link: '/guide/configuration' }
              ]
            }
          ]
        },
        editLink: {
          pattern: 'https://github.com/zsubera/myjpa-plus/edit/main/docs/:path'
        },
        footer: {
          message: 'Released under the Apache 2.0 License.',
          copyright: 'Copyright © 2024-present Zsubera'
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      title: 'MyJpa-Plus',
      description: '基于 Lambda 的类型安全 JPA 动态查询构建器',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: 'API', link: '/zh/guide/api' },
          {
              text: 'v1.2.0',
            items: [
              { text: '更新日志', link: '/zh/changelog' },
              { text: '贡献指南', link: '/zh/contributing' }
            ]
          }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '介绍',
              items: [
                { text: '什么是 MyJpa-Plus?', link: '/zh/guide/what-is-myjpa-plus' },
                { text: '快速开始', link: '/zh/guide/getting-started' }
              ]
            },
            {
              text: '指南',
              items: [
                { text: 'QuerySpec 查询', link: '/zh/guide/query-spec' },
                { text: '关联查询', link: '/zh/guide/joins' },
                { text: '子查询', link: '/zh/guide/sub-queries' },
                { text: '批量更新与删除', link: '/zh/guide/bulk-operations' },
                { text: 'UPSERT / MergeSpec', link: '/zh/guide/upsert' },
                { text: 'CTE 公共表表达式', link: '/zh/guide/cte' },
                { text: '软删除', link: '/zh/guide/soft-delete' },
                { text: '字段加密', link: '/zh/guide/encryption' },
                { text: '审计注解', link: '/zh/guide/audit' },
                { text: 'MyJpaTemplate', link: '/zh/guide/myjpa-template' },
                { text: '投影查询', link: '/zh/guide/projection' },
                { text: '代码生成', link: '/zh/guide/code-generation' }
              ]
            },
            {
              text: '参考',
              items: [
                { text: 'API 参考', link: '/zh/guide/api' },
                { text: '配置', link: '/zh/guide/configuration' }
              ]
            }
          ]
        },
        editLink: {
          pattern: 'https://github.com/zsubera/myjpa-plus/edit/main/docs/:path'
        },
        footer: {
          message: '基于 Apache 2.0 许可发布',
          copyright: 'Copyright © 2024-present Zsubera'
        },
        outline: {
          label: '页面导航'
        },
        lastUpdated: {
          text: '最后更新于'
        },
        docFooter: {
          prev: '上一页',
          next: '下一页'
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zsubera/myjpa-plus' }
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  }
})
