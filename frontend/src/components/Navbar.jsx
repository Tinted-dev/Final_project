import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => setIsOpen(!isOpen)
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="font-bold text-xl text-gray-800">Garbage Collectors</Link>

        <button onClick={toggleMenu} className="sm:hidden focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <div className={`sm:flex sm:items-center ${isOpen ? 'block' : 'hidden'}`}>
          <NavLink to="/" className={({isActive}) => (isActive ? 'text-blue-600 px-3' : 'text-gray-600 px-3')}>Home</NavLink>
          <NavLink to="/companies" className={({isActive}) => (isActive ? 'text-blue-600 px-3' : 'text-gray-600 px-3')}>Companies</NavLink>
          {!user && (
            <>
              <NavLink to="/login" className={({isActive}) => (isActive ? 'text-blue-600 px-3' : 'text-gray-600 px-3')}>Login</NavLink>
              <NavLink to="/register" className={({isActive}) => (isActive ? 'text-blue-600 px-3' : 'text-gray-600 px-3')}>Register</NavLink>
            </>
          )}
          {user && (
            <>
              <span className="text-gray-700 px-3">Hi, {user.name}</span>
              <button onClick={handleLogout} className="text-red-600 px-3 hover:underline">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
