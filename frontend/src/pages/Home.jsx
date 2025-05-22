import React, { useEffect, useState } from "react";

// Images for the hero section slideshow
const images = [
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80", // Green environment
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1920&q=80", // City with nature, futuristic feel
  "https://images.unsplash.com/photo-1484910292437-025e5d13ce87?auto=format&fit=crop&w=1920&q=80", // Sustainability focus
  // "https://images.unsplash.com/photo-1517772590747-d576361a4947?auto=format&fit=crop&w=1920&q=80", // Modern waste facility
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image slideshow effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 8000); // Change image every 8 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-gray-900 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image Slideshow */}
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Environment ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/1920x1080/E0E7FF/3B82F6?text=Image+Load+Error"; }}
          />
        ))}
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-blue-900 opacity-20"></div> {/* Blue tint */}

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6 py-12 md:px-12 lg:px-24">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in-up drop-shadow-2xl">
            Pioneering a Cleaner Tomorrow
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl animate-fade-in drop-shadow-lg">
            Connecting innovative waste management solutions with communities for a sustainable and efficient future.
          </p>
          <a
            href="/companies"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out text-lg tracking-wide uppercase"
          >
            Explore Companies
          </a>
        </div>
      </div>

      {/* Our Vision Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-r from-blue-700 to-green-600 text-white shadow-inner-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-md">Our Vision for a Sustainable Future</h2>
          <p className="text-lg leading-relaxed opacity-90">
            We envision a world where waste management is seamless, efficient, and environmentally responsible. By leveraging cutting-edge technology, we empower communities and businesses to connect with the best waste collection services, fostering a cleaner planet for generations to come. Our platform is built on principles of transparency, innovation, and unwavering commitment to ecological balance.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white shadow-md">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="text-5xl text-blue-600 mb-4">
              <i className="fas fa-search"></i> {/* Font Awesome Search Icon */}
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Discover Services</h3>
            <p className="text-gray-700">Easily browse and filter through a diverse range of garbage collection companies and their specialized services in your region.</p>
          </div>
          {/* Step 2 */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="text-5xl text-green-600 mb-4">
              <i className="fas fa-handshake"></i> {/* Font Awesome Handshake Icon */}
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Connect & Contract</h3>
            <p className="text-gray-700">Directly connect with companies, view their detailed profiles, and choose the perfect partner for your waste management needs.</p>
          </div>
          {/* Step 3 */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="text-5xl text-purple-600 mb-4">
              <i className="fas fa-recycle"></i> {/* Font Awesome Recycle Icon */}
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Sustainable Future</h3>
            <p className="text-gray-700">Contribute to a greener planet by engaging with eco-conscious companies committed to responsible waste disposal.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-900 text-white">
        <h2 className="text-4xl font-bold text-center mb-12 drop-shadow-md">Why Choose WasteTrack?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="flex items-start space-x-6">
            <div className="text-5xl text-green-400 flex-shrink-0">
              <i className="fas fa-globe"></i> {/* Globe Icon */}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Global Reach, Local Impact</h3>
              <p className="text-gray-300">Our platform connects you with services across various regions, ensuring you find local solutions that make a global difference.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="text-5xl text-blue-400 flex-shrink-0">
              <i className="fas fa-shield-alt"></i> {/* Shield Icon */}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Verified Partners</h3>
              <p className="text-gray-300">Every company on WasteTrack undergoes an approval process, guaranteeing reliable and high-quality service providers.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="text-5xl text-yellow-400 flex-shrink-0">
              <i className="fas fa-chart-line"></i> {/* Chart Line Icon */}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Efficiency & Innovation</h3>
              <p className="text-gray-300">We leverage modern technology to provide a seamless experience, from company discovery to profile management.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="text-5xl text-red-400 flex-shrink-0">
              <i className="fas fa-heart"></i> {/* Heart Icon */}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Community Focused</h3>
              <p className="text-gray-300">Our mission is to foster cleaner, healthier communities by simplifying waste management for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 px-6 md:px-12 lg:px-24 text-center shadow-md">
        <h2 className="text-4xl font-bold mb-10 text-gray-800">WasteTrack By The Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-gray-700 max-w-6xl mx-auto">
          <div className="bg-blue-50 p-8 rounded-xl shadow-lg transform hover:translate-y-[-5px] transition duration-300 ease-in-out">
            <h3 className="text-5xl font-extrabold text-blue-700 mb-3">150+</h3>
            <p className="text-xl font-medium">Registered Companies</p>
          </div>
          <div className="bg-green-50 p-8 rounded-xl shadow-lg transform hover:translate-y-[-5px] transition duration-300 ease-in-out">
            <h3 className="text-5xl font-extrabold text-green-700 mb-3">45</h3>
            <p className="text-xl font-medium">Active Regions</p>
          </div>
          <div className="bg-purple-50 p-8 rounded-xl shadow-lg transform hover:translate-y-[-5px] transition duration-300 ease-in-out">
            <h3 className="text-5xl font-extrabold text-purple-700 mb-3">10K+</h3>
            <p className="text-xl font-medium">Community Members</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-20 px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Voices From Our Community
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-gray-700 transform hover:shadow-xl transition duration-300 ease-in-out">
            <p className="italic text-lg mb-4">"WasteTrack made finding a reliable service incredibly simple. The interface is intuitive and effective!"</p>
            <p className="mt-4 font-semibold text-gray-800">— Grace N., Nairobi</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-gray-700 transform hover:shadow-xl transition duration-300 ease-in-out">
            <p className="italic text-lg mb-4">"The sleek design and rapid performance of WasteTrack are truly impressive. A game-changer for waste management."</p>
            <p className="mt-4 font-semibold text-gray-800">— James K., Kisumu</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-gray-700 transform hover:shadow-xl transition duration-300 ease-in-out">
            <p className="italic text-lg mb-4">
              "Thanks to WasteTrack, I easily transitioned to an eco-friendlier garbage collection service. Highly recommended!"
            </p>
            <p className="mt-4 font-semibold text-gray-800">— Amina M., Mombasa</p>
          </div>
        </div>
      </section>

      {/* Join Our Network (Call to Action for Companies) */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-blue-800 to-purple-900 text-white text-center shadow-2xl">
        <h2 className="text-4xl font-bold mb-6 drop-shadow-md">Become a Partner in Sustainability</h2>
        <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">
          Are you a garbage collection company committed to a cleaner environment? Join WasteTrack's growing network and connect with thousands of potential clients.
        </p>
        <a
          href="/register-company"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-full shadow-xl transform hover:scale-105 transition duration-300 ease-in-out text-xl tracking-wide uppercase"
        >
          Register Your Company Today
        </a>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16 px-6 md:px-12 lg:px-24 shadow-inner">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Get In Touch
        </h2>
        <div className="max-w-2xl mx-auto text-center text-gray-700 space-y-6">
          <p className="text-lg">
            Have questions, feedback, or just want to say hello? Our dedicated support team is here to assist you.
          </p>
          <p className="text-xl">
            📧 Email:{" "}
            <a
              href="mailto:support@wastetrack.com"
              className="text-blue-600 hover:text-blue-800 underline font-semibold transition duration-200"
            >
              support@wastetrack.com
            </a>
          </p>
          <p className="text-xl">📍 Location: Nairobi, Kenya</p>
          <p className="text-xl">📞 Phone: +254 729 698 288</p>
          <div className="flex justify-center space-x-6 mt-8 text-3xl">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition duration-200">
              <i className="fab fa-facebook-f"></i> {/* Facebook Icon */}
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-400 transition duration-200">
              <i className="fab fa-twitter"></i> {/* Twitter Icon */}
            </a>
            <a href="#" className="text-gray-600 hover:text-pink-600 transition duration-200">
              <i className="fab fa-instagram"></i> {/* Instagram Icon */}
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-700 transition duration-200">
              <i className="fab fa-linkedin-in"></i> {/* LinkedIn Icon */}
            </a>
          </div>
        </div>
      </section>

      {/* Tailwind CSS keyframes for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        .drop-shadow-2xl {
          text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        .drop-shadow-lg {
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
