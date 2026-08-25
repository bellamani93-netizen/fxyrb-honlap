import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import MiniKurzus from './pages/MiniKurzus'
import Idopontfoglalas from './pages/Idopontfoglalas'
import Belepes from './pages/Belepes'
import Gyakorlatok from './pages/Gyakorlatok'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/mini-kurzus" element={<MiniKurzus />} />
        <Route path="/idopontfoglalas" element={<Idopontfoglalas />} />
        <Route path="/belepes" element={<Belepes />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/gyakorlatok" element={<Gyakorlatok />} />
      </Route>
    </Routes>
  )
}
