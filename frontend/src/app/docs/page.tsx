import type { Metadata } from 'next';
import DocsPageClient from './DocsPageClient';

export const metadata: Metadata = {
  title: 'Documentation & API Guides',
  description: 'Integrate native feedback collection, configure masonry widgets, and leverage AI sentiment analysis endpoints.',
  alternates: {
    canonical: '/docs'
  }
};

export default function Page() {
  return <DocsPageClient />;
}
