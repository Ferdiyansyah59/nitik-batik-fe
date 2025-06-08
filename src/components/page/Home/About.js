import Description from '@/components/micro/Description';
import ImageComponent from '@/components/micro/ImageComponent';
import SectionTitle from '@/components/micro/SectionTitle';

function About() {
  return (
    <section
      className="flex flex-col items-center md:items-start md:flex-row justify-around mx-5 md:mx-20 lg:mx-40 gap-20 my-20"
      data-aos="fade-up"
    >
      <ImageComponent
        src="/img/about.png"
        className="w-60 lg:w-96"
        alt="Home About"
      />
      <div className="w-4/5 lg:w-1/2" data-aos="fade-up">
        <SectionTitle title="Tentang Batik Kita" />
        <Description
          className="mt-3 text-justify"
          text="Batik adalah kain bergambar yang dibuat dengan teknik pewarnaan khusus menggunakan malam (lilin) untuk membentuk motif. Lebih dari sekadar seni, batik adalah bagian dari identitas budaya Indonesia — setiap pola dan warna mengandung makna, filosofi, dan sejarah yang kaya. Dari upacara adat hingga busana sehari-hari, batik telah menjadi simbol keanggunan dan kebanggaan nusantara."
        />
      </div>
    </section>
  );
}

export default About;
