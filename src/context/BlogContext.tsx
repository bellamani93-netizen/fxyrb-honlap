import { createContext, useContext, useState, type ReactNode } from 'react'
import { initialBlogPosts, initialCategories, type BlogPost } from '../data/blogPosts'

// A "mélyedukáció" (korábban "blog") oldal és az admin szerkesztő közös
// állapota — az admin itt vesz fel új bejegyzést/kategóriát, ez azonnal
// megjelenik a nyilvános oldalon is, ugyanúgy, ahogy a többi context is egy
// közös forrást oszt meg a fiókok között (2026.09.02., Marci kérésére).
type BlogContextValue = {
  posts: BlogPost[]
  categories: string[]
  addPost: (post: { title: string; category: string; content: string }) => void
  addCategory: (name: string) => void
}

const BlogContext = createContext<BlogContextValue | null>(null)

export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error('useBlog csak BlogProvideren belül használható')
  return ctx
}

function formatToday() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}.`
}

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialBlogPosts)
  const [categories, setCategories] = useState<string[]>(initialCategories)

  function addPost(post: { title: string; category: string; content: string }) {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: post.title.trim(),
      category: post.category,
      content: post.content.trim(),
      date: formatToday(),
    }
    // legújabb legfelül — ugyanaz a sorrend, mint amit az olvasók a nyilvános
    // oldalon elvárnak (legfrissebb elöl).
    setPosts((prev) => [newPost, ...prev])
  }

  function addCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed || categories.includes(trimmed)) return
    setCategories((prev) => [...prev, trimmed])
  }

  return <BlogContext.Provider value={{ posts, categories, addPost, addCategory }}>{children}</BlogContext.Provider>
}
