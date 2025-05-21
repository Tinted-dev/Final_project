export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-6 mt-12">
      <p className="text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Garbage Collectors App. All rights reserved.
      </p>
    </footer>
  )
}
