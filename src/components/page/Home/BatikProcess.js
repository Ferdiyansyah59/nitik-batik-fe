import Description from '@/components/micro/Description';
import SectionTitle from '@/components/micro/SectionTitle';

export default function BatikProcess() {
  const steps = [
    {
      title: 'Persiapan Kain',
      description: 'Memilih kain mori berkualitas sebagai media batik.',
      icon: '🧵',
    },
    {
      title: 'Membuat Pola',
      description: 'Menggambar desain atau motif batik dengan teliti.',
      icon: '✏️',
    },
    {
      title: 'Membatik',
      description: 'Melukis motif menggunakan malam (lilin batik).',
      icon: '🖌️',
    },
    {
      title: 'Pewarnaan',
      description: 'Mencelup kain dengan warna tradisional.',
      icon: '🎨',
    },
    {
      title: 'Pelorodan',
      description: 'Menghilangkan lilin dengan perendaman air panas.',
      icon: '💦',
    },
  ];

  return (
    <section className="py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <SectionTitle title="Proses Pembuatan Batik" />
        <Description text="Perjalanan panjang menciptakan karya seni batik yang memukau" />

        <div className="grid md:grid-cols-5 gap-4 mt-10">
          {steps.map((step, index) => (
            <div
              data-aos="fade-up"
              key={index}
              className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
