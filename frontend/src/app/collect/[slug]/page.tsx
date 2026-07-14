import type { Metadata } from 'next';
import CollectPageClient from './CollectPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query CollectionBySlug($slug: String!) {
            collectionBySlug(slug: $slug) {
              name
              headline
              subheadline
              logoUrl
            }
          }
        `,
        variables: { slug }
      }),
      next: { revalidate: 60 } // Cache space metadata for 60 seconds
    });

    if (res.ok) {
      const { data } = await res.json();
      const page = data?.collectionBySlug;
      if (page) {
        return {
          title: `${page.name} - Testimonial Collection`,
          description: page.headline || page.subheadline || 'Submit your video or text feedback and share your product review.',
          openGraph: {
            title: `${page.name} Feedback Collection`,
            description: page.headline || 'Submit your testimonial page.',
            images: page.logoUrl ? [{ url: page.logoUrl }] : []
          }
        };
      }
    }
  } catch (err) {
    console.error('Failed to fetch collect space metadata during build:', err);
  }

  return {
    title: 'Submit Testimonial | Proofly',
    description: 'Share your feedback, video reviews, or text recommendations securely.'
  };
}

export default function Page() {
  return <CollectPageClient />;
}
