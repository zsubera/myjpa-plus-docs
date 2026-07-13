import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '类型安全查询',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        基于 Lambda 的 QuerySpec，支持 eq/ne/gt/lt/like/in/between。编译期捕获字段名错误。
      </>
    ),
  },
  {
    title: '批量操作',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        类型安全的 UPDATE/DELETE，支持行数限制、批量执行和条件 SET 子句。
      </>
    ),
  },
  {
    title: 'UPSERT / MERGE',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        PostgreSQL、MySQL、Oracle、SQL Server 的 INSERT ... ON CONFLICT。多行批量优化。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
