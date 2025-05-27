'use client';

import { useEffect, useState } from 'react';
// import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerWithRedirect, isLoading, error, clearError } = useAuth();
  // const router = useRouter();

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) clearError();
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form sederhana
    if (!name || !email || !password) {
      return;
    }

    // Login dengan redirect
    await registerWithRedirect(name, email, password);
  };

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-5 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <p className="text-sm text-center">
            <b>Buat Akun</b> dan mulai tampilkan katalog produk batikmu biar
            makin banyak yang lihat koleksimu.
          </p>
        </div>

        <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nama */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Nama
              </label>
              <div className="mt-2">
                <input
                  type="name"
                  name="name"
                  id="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 border-b border-primary text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:border-none focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                />
              </div>
            </div>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 border-b border-primary text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:border-none focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 border-b border-primary text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:border-none focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Membuat akun...' : 'Registrasi'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Sudah punya akun ?{' '}
            <a
              href="/register"
              className="font-semibold text-primary hover:text-indigo-500 hover:cursor-pointer"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterForm;
