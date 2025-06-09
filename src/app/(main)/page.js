// import Image from "next/image";
// import styles from "./page.module.css";
// import About from "@/components/page/Home/About";
import About from '@/components/page/Home/About';
import Article from '@/components/page/Home/Article';
import Category from '@/components/page/Home/Category';
import Hero from '@/components/page/Home/Hero';
import BatikProcess from '@/components/page/Home/BatikProcess';
import BatikTypes from '@/components/page/Home/BatikTypes';
import BatikRegions from '@/components/page/Home/BatikRegions';

export const metadata = {
  title: 'Beranda',
};

export default function Home() {
  return (
    <section className="overflow-x-hidden">
      <Hero />
      <About />
      {/* <Category /> */}
      <BatikProcess />
      <BatikTypes />
      <BatikRegions />
      <Article />
    </section>
  );
}
