'use client';
import { useStoreHooks } from '@/hooks/useStore';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

function Store() {
  //   const { createStore } = useStoreStore();
  const { createStoreRedirect } = useStoreHooks();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsapp: '',
    alamat: '',
  });
  const user = useAuthStore.getState().user;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    try {
      await createStoreRedirect(formData);
      console.log('Berhasil');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // console.log('Ini dari store', user);
  });
  return (
    <form className="flex flex-col max-w-xl gap-10 p-10">
      <input
        type="text"
        onChange={handleInputChange}
        value={formData.name}
        className="border border-black"
        name="name"
      />
      <textarea
        cols="2"
        rows="10"
        onChange={handleInputChange}
        value={formData.description}
        className="border border-black"
        name="description"
      />
      <input
        type="text"
        onChange={handleInputChange}
        value={formData.whatsapp}
        className="border border-black"
        name="whatsapp"
      />
      <textarea
        cols="2"
        rows="10"
        onChange={handleInputChange}
        value={formData.alamat}
        className="border border-black"
        name="alamat"
      />
      <button onClick={handleSubmit} type="button">
        Submit
      </button>
    </form>
  );
}

export default Store;
