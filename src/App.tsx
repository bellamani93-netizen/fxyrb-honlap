import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import MiniKurzus from './pages/MiniKurzus'
import Idopontfoglalas from './pages/Idopontfoglalas'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/mini-kurzus" element={<MiniKurzus />} />
        <Route path="/idopontfoglalas" element={<Idopontfoglalas />} />
      </Route>
    </Routes>
  )
}
