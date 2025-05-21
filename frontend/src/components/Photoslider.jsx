import React, { useState, useEffect } from 'react'

const photos = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1350&q=80'
]

export default function PhotoSlider() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % photos.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
      {photos.map((photo, i) => (
        <img
          key={i}
          src={photo}
          alt="Background Slide"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out
          ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          loading="lazy"
        />
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold drop-shadow-lg">Welcome to Garbage Collectors</h1>
      </div>
    </div>
  )
}
