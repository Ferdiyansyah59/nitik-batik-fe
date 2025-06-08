import { notFound } from 'next/navigation';
import ArticleDetail from '@/components/page/Article/ArticleDetail';

// ✅ FETCH DATA DI SERVER - SINGLE SOURCE
async function getArticle(slug) {
  try {
    // Pakai server-side URL (bisa beda dengan client)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    const res = await fetch(`${apiUrl}/api/articles/slug/${slug}`, {
      cache: 'no-store', // Atau sesuai kebutuhan caching
      headers: {
        'Content-Type': 'application/json',
        // Bisa tambah auth header jika diperlukan
        // 'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // Will trigger notFound()
      }
      throw new Error(`Failed to fetch article: ${res.status}`);
    }

    const data = await res.json();
    return data.status ? data.data : null;
  } catch (error) {
    console.error('❌ Server fetch error:', error);
    return null;
  }
}

// ✅ GENERATE METADATA BERDASARKAN DATA SERVER
export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const article = await getArticle(slug);

    if (!article) {
      return {
        title: 'Article Not Found | Batik Nusantara',
        description: 'The requested article could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    // Clean description untuk meta tags
    const cleanDescription = article.excerpt
      ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 160)
      : article.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
        'Read about Indonesian batik culture and traditions.';

    const imageUrl = article.imageUrl
      ? `${process.env.NEXT_PUBLIC_API_URL}${article.imageUrl}`
      : `${process.env.NEXT_PUBLIC_API_URL}/img/default-article.jpg`;

    return {
      title: `${article.title} | Batik Nusantara`,
      description: cleanDescription,
      keywords: `batik, ${article.title}, indonesian culture, traditional art, ${article.author || ''}`,
      authors: [{ name: article.author || 'Batik Nusantara Team' }],
      creator: 'Batik Nusantara',
      publisher: 'Batik Nusantara',

      // Open Graph
      openGraph: {
        title: article.title,
        description: cleanDescription,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/articles/${slug}`,
        siteName: 'Batik Nusantara',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        type: 'article',
        publishedTime: article.created_At,
        modifiedTime: article.updated_At || article.created_At,
        authors: 'NitikBatik Team',
        section: 'Culture',
        tags: ['batik', 'culture', 'indonesia'],
      },

      // Canonical URL
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/articles/${slug}`,
      },
    };
  } catch (error) {
    console.error('❌ Metadata generation error:', error);
    return {
      title: 'Error Loading Article | Batik Nusantara',
      description: 'An error occurred while loading this article.',
    };
  }
}

// ✅ SERVER COMPONENT - FETCH SEKALI DI SINI
export default async function DetailArticle({ params }) {
  const { slug } = params;

  console.log('🔍 Server fetching article:', slug);

  // Fetch data di server
  const article = await getArticle(slug);

  // Handle article tidak ditemukan
  if (!article) {
    console.log('❌ Article not found:', slug);
    notFound();
  }

  console.log('✅ Article found:', article.title);

  return (
    <section className="mt-20">
      {/* 
        ✅ PASS DATA SEBAGAI PROPS KE CLIENT COMPONENT
        Client component TIDAK perlu fetch lagi
      */}
      <ArticleDetail initialArticle={article} slug={slug} />

      {/* ✅ SERVER-SIDE RENDERED STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt?.replace(/<[^>]*>/g, '') || '',
            image: article.imageUrl
              ? `${process.env.NEXT_PUBLIC_API_URL}${article.imageUrl}`
              : '',
            author: {
              '@type': 'Person',
              name: 'Nitik Batik Team',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Batik Nusantara',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_API_URL}/img/logo.png`,
              },
            },
            datePublished: article.created_At,
            dateModified: article.updated_At || article.created_At,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_APP_URL}/articles/${slug}`,
            },
          }),
        }}
      />
    </section>
  );
}
