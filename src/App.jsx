import { useState } from 'react'
import PosMainPageNew from './pages/PointOfSaleNew'
import './App.css'
import Sidebar from './components/Sidebar'

function App() {
  const [active, setActive] = useState('pos')

  const renderContent = () => {
    switch (active) {
      case 'pos':
        return <PosMainPageNew />
      default:
        return <div>Hello</div>
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
    <Sidebar active={active} setActive={setActive} />
    <div className="flex-1">
      {renderContent()}
    </div>
  </div>
  )
}

export default App
