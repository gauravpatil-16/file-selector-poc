import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const FloatingActionButton = () => {
  const navigate = useNavigate()

  const handleCreatePost = () => {
    navigate("/create")
  }

  return (
    <button
      onClick={handleCreatePost}
      className={cn(
        "fixed bottom-20 right-4 md:bottom-24 md:right-6",
        "w-14 h-14 bg-gradient-primary text-white rounded-full shadow-fab",
        "flex items-center justify-center",
        "hover:scale-110 hover:shadow-lg active:scale-95",
        "transition-all duration-normal z-dropdown",
        "focus:outline-none focus:ring-4 focus:ring-primary/20"
      )}
      aria-label="Create new post"
    >
      <ApperIcon name="Plus" size={24} />
    </button>
  )
}

export default FloatingActionButton