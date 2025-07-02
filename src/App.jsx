import { useState } from 'react'
import PosMainPage from './pages/PointOfSale'
import './App.css'
import Sidebar from './components/Sidebar'

function App() {
  const [active, setActive] = useState('pos')

  const renderContent = () => {
    switch (active) {
      case 'pos':
        return <PosMainPage />
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
