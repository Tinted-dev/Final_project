import React, { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7", // nature
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6", // city + nature
  "https://images.unsplash.com/photo-1484910292437-025e5d13ce87", // sustainability
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-gray-900">
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${images[currentImageIndex]}?auto=format&fit=crop&w=1920&q=80`}
            alt="Environment"
            className="object-cover w-full h-full transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Welcome to WasteTrack
          </h1>
          <p className="text-lg md:text-2xl mb-8 drop-shadow-md">
            Connecting communities to clean, sustainable waste services.
          </p>
          <a
            href="/companies"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
          >
            Explore Companies
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <section className="bg-white py-12 px-6 md:px-20 text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">At a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
          <div>
            <h3 className="text-4xl font-extrabold text-green-600">150+</h3>
            <p className="mt-2">Registered Companies</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-green-600">45</h3>
            <p className="mt-2">Active Regions</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-green-600">10K+</h3>
            <p className="mt-2">Users Served</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-12 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">
          What Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-gray-700">
            <p className="italic">"Super easy to find reliable services in my area!"</p>
            <p className="mt-4 font-semibold">— Grace N., Nairobi</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-gray-700">
            <p className="italic">"I love the sleek design and how fast the site is."</p>
            <p className="mt-4 font-semibold">— James K., Kisumu</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-gray-700">
            <p className="italic">
              "This app helped me switch to a better garbage collection service."
            </p>
            <p className="mt-4 font-semibold">— Amina M., Mombasa</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-12 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Contact Us
        </h2>
        <div className="text-center text-gray-700 space-y-4">
          <p>
            Have questions or feedback? Reach out to our support team and we’ll
            get back to you.
          </p>
          <p>
            📧 Email:{" "}
            <a
              href="mailto:support@wastetrack.com"
              className="text-green-600 underline"
            >
              support@wastetrack.com
            </a>
          </p>
          <p>📍 Location: Nairobi, Kenya</p>
          <p>📞 Phone: +254 712 345 678</p>
        </div>
      </section>
    </div>
  );
}
