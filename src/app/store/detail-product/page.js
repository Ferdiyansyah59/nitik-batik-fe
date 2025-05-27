'use client';
import { useState } from 'react';

function DetailProduct() {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('camel');
  const [selectedSize, setSelectedSize] = useState('S');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const colors = [
    { name: 'camel', image: '/img/products/silk-camel.jpg' },
    { name: 'black', image: '/img/products/silk-black.jpg' },
  ];

  const sizes = ['XS', 'S', 'M', 'L'];

  const productImages = [
    { id: 0, src: '/img/category/bali.png', alt: 'Silk shirt front view' },
    { id: 1, src: '/img/category/kraton.png', alt: 'Silk shirt side view' },
    {
      id: 2,
      src: '/img/store_categories/kemeja.png',
      alt: 'Silk shirt back view',
    },
    {
      id: 3,
      src: '/img/store_categories/blus.png',
      alt: 'Silk shirt with accessories',
    },
  ];

  const accordionItems = [
    {
      id: 'description',
      title: 'Description',
      content:
        'A luxurious silk shirt that drapes beautifully. Made from 100% mulberry silk with a satin finish.',
    },
  ];

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Product Images */}
        <div className="md:w-3/5">
          <div className="flex flex-row md:flex-row gap-4">
            {/* Thumbnails - Vertical on Desktop */}
            <div className="hidden md:flex flex-col gap-4 w-1/5">
              {productImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`cursor-pointer border hover:border-gray-400 transition ${
                    currentImage === index
                      ? 'border-gray-800'
                      : 'border-gray-200'
                  } w-full aspect-square overflow-hidden`}
                  onClick={() => setCurrentImage(index)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="w-full md:w-4/5 aspect-[3/4] bg-gray-50 overflow-hidden">
              <img
                src={productImages[currentImage].src}
                alt={productImages[currentImage].alt}
                className="w-full h-full object-contain object-center"
              />

              {/* Product Pagination Dots (Mobile) */}
              <div className="flex justify-center gap-2 mt-4 md:hidden">
                {productImages.map((image, index) => (
                  <button
                    key={image.id}
                    className={`w-2 h-2 rounded-full ${
                      currentImage === index ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="md:w-2/5 bg-gray-50 p-6 rounded-lg">
          {/* Product Name & Price */}
          <h1 className="text-2xl font-light mb-2">Silk shirt</h1>
          <p className="text-xl mb-6">Rp 2.300.000</p>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Size:</p>
              <a href="#" className="text-xs text-gray-600 underline">
                Size guide
              </a>
            </div>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    selectedSize === size
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : 'border-gray-300 text-gray-800'
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Color: {selectedColor}</p>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`w-12 h-12 border overflow-hidden ${
                    selectedColor === color.name
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedColor(color.name)}
                >
                  <div className="w-full h-full">
                    <img
                      src={color.image || `/api/placeholder/50/50`}
                      alt={`${color.name} color`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Bag */}
          <div className="flex gap-2 mb-6">
            <div className="flex border border-gray-300 rounded-sm">
              <button
                className="px-3 py-2 text-gray-600"
                onClick={decrementQuantity}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                className="px-3 py-2 text-gray-600"
                onClick={incrementQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button className="flex-1 bg-gray-800 text-white py-2 px-4 hover:bg-gray-900 transition">
              Add to bag
            </button>

            <button
              className="p-2 border border-gray-300"
              aria-label="Add to wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Store info */}
          <button className="flex items-center gap-5 my-10">
            <img
              className="h-14 w-14 rounded-full"
              src="/img/category/parang.png"
              alt="toko"
            />
            <div className="text-start">
              <h1 className="text-base font-medium">Toko Batik Na</h1>
              <p className="text-xs">Jakarta Timur</p>
            </div>
          </button>

          {/* Accordion Sections */}
          <div className="border-t border-gray-200">
            {accordionItems.map((item) => (
              <div key={item.id} className="border-b border-gray-200">
                <button
                  className="w-full py-4 flex justify-between items-center text-left"
                  onClick={() => toggleAccordion(item.id)}
                >
                  <span className="text-sm text-gray-500">{item.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === item.id ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {activeAccordion === item.id && (
                  <div className="pb-4 text-sm text-gray-600">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;
