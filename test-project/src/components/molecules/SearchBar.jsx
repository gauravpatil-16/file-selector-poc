import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import { cn } from '@/utils/cn'

const SearchBar = ({ className, placeholder = "Search...", onSearch }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        // Navigate to discover page with search query
        navigate(`/discover?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ApperIcon name="Search" size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-fast placeholder-gray-500"
        />
      </div>
    </form>
  )
}

export default SearchBar