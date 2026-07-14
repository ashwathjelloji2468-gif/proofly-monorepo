import type { Metadata } from 'next';
import PublicWallPageClient from './PublicWallPageClient';

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
          query PublicShowcase($slug: String!) {
            publicShowcase(slug: $slug) {
              space {
                name
                logoUrl
              }
              settings {
                headline
                subheadline
                metaTitle
                metaDescription
              }
            }
          }
        `,
        variables: { slug }
      }),
      next: { revalidate: 60 } // Cache space metadata for 60 seconds
    });

    if (res.ok) {
      const { data } = await res.json();
      const showcase = data?.publicShowcase;
      if (showcase) {
        const title = showcase.settings?.metaTitle || `${showcase.space?.name} Wall of Love`;
        const description = showcase.settings?.metaDescription || showcase.settings?.headline || showcase.settings?.subheadline || 'Explore video and text reviews shared by verified customers.';
        const logo = showcase.settings?.logoUrl || showcase.space?.logoUrl;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: logo ? [{ url: logo }] : []
          }
        };
      }
    }
  } catch (err) {
    console.error('Failed to fetch public wall metadata during build:', err);
  }

  return {
    title: 'Customer Wall of Love | Proofly',
    description: 'Explore video reviews and recommendations shared by verified customers.'
  };
}

export default function Page() {
  return <PublicWallPageClient />;
}
