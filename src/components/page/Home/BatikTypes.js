import Description from '@/components/micro/Description';
import SectionTitle from '@/components/micro/SectionTitle';

export default function BatikTypes() {
  const batikTypes = [
    {
      name: 'Batik Tulis',
      description: 'Dikerjakan secara manual dengan menggunakan canting.',
      difficulty: 'Tinggi',
      image: '/img/batik-tulis.jpg',
    },
    {
      name: 'Batik Cap',
      description: 'Dibuat menggunakan cap atau stempel khusus.',
      difficulty: 'Sedang',
      image: '/img/batik-cap.jpg',
    },
    {
      name: 'Batik Print',
      description: 'Dicetak menggunakan mesin dengan teknologi modern.',
      difficulty: 'Rendah',
      image: '/img/batik-print.jpg',
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionTitle title="Jenis-Jenis Batik" />
        <Description text="Mengenal ragam teknik pembuatan batik di Indonesia" />

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {batikTypes.map((type, index) => (
            <div
              data-aos="fade-left"
              key={index}
              className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={type.image}
                  alt={type.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                <p className="text-gray-600 mb-3">{type.description}</p>
                <div className="flex items-center">
                  <span className="text-sm mr-2">Tingkat Kesulitan:</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                    {type.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
