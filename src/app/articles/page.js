import Description from '@/components/micro/Description';
import CardArticle from '@/components/page/Article/Card';

export const metadata = {
  title: 'Artikel',
  description:
    'Temukan artikel terbaru seputar batik yang edukatif dan inspiratif untuk menambah pengetahuan Anda tentang budaya batik Indonesia.',
};

function Article() {
  return (
    <section className="mt-28">
      <CardArticle />
    </section>
  );
}

export default Article;
