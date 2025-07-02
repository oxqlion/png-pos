import { ShoppingCart, BarChart3, Package, Clock, Settings, LogOut, HelpCircle } from 'lucide-react'

const Sidebar = ({ active, setActive }) => {

    const handleClick = (active) => {
        setActive(active)
    }

    return (
        <div className="w-64 bg-white shadow-lg flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">PalmPay</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-600 rounded-lg cursor-pointer" onClick={() => handleClick('pos')}>
                            <ShoppingCart size={20} />
                            <span className="font-medium">Point of Sale</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => handleClick('activity')}>
                            <BarChart3 size={20} />
                            <span>Activity</span>
                            <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => handleClick('inventory')}>
                            <Package size={20} />
                            <span>Inventory</span>
                            <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => handleClick('shift')}>
                            <Clock size={20} />
                            <span>Shift</span>
                            <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => handleClick('settings')}>
                            <Settings size={20} />
                            <span>Settings</span>
                            <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">EW</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">Ella Watson</div>
                            <div className="text-sm text-gray-500">Cashier</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded" onClick={() => handleClick('logout')}>
                            <LogOut size={16} />
                            <span className="text-sm">Log Out</span>
                        </button>
                        <button className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded" onClick={() => handleClick('help')}>
                            <HelpCircle size={16} />
                            <span className="text-sm">Help</span>
                        </button>
                    </div>
                </div>
        </div>
    )
}

export default Sidebar