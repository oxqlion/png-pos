import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    SortAsc,
    User,
    Plus,
    Minus,
    X,
    Check,
    Share,
    LogOut,
    HelpCircle,
    BarChart3,
    Package,
    Clock,
    Settings,
    ChevronDown,
    Heart,
    Printer
} from 'lucide-react';

const PosMainPage = () => {
    const [cart, setCart] = useState([
        { id: 1, name: 'Ice Cream', price: 16000, quantity: 1 },
        { id: 2, name: 'SilverQueen', price: 20000, quantity: 2 },
        { id: 3, name: 'Lays', price: 18000, quantity: 1 }
    ]);

    const [showItemModal, setShowItemModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [paymentStep, setPaymentStep] = useState('waiting'); // waiting, success
    const [customerName, setCustomerName] = useState('Customer Name');
    const [orderType, setOrderType] = useState('Dine in');

    // Sample product data
    const products = Array(9).fill(null).map((_, index) => ({
        id: index + 1,
        name: 'Pocky',
        price: 15000,
        image: '/api/placeholder/150/150',
        isFavorite: index < 2
    }));

    // Timer effect for payment flow
    useEffect(() => {
        let timer;
        if (showPaymentModal && paymentStep === 'waiting') {
            timer = setTimeout(() => {
                setPaymentStep('success');
            }, 3000);
        } else if (showPaymentModal && paymentStep === 'success') {
            timer = setTimeout(() => {
                setShowPaymentModal(false);
                setShowReceiptModal(true);
                setPaymentStep('waiting');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [showPaymentModal, paymentStep]);

    const handleProductClick = (product) => {
        setSelectedItem({
            ...product,
            variant: 'Chocolate',
            quantity: 2,
            discounts: {
                member: false,
                buyOneGetOne: false,
                dineIn: false,
                owner: false,
                opening: false,
                compliment: false
            },
            salesType: 'Dine In',
            notes: ''
        });
        setShowItemModal(true);
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTax = (subtotal, rate, name) => {
        return Math.round(subtotal * rate);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tipServer = calculateTax(subtotal, 0.03, 'Tip Server');
        const pajakRestoran = calculateTax(subtotal, 0.10, 'Pajak Restoran');
        const ppn = calculateTax(subtotal, 0.10, 'PPN');
        return subtotal + tipServer + pajakRestoran + ppn;
    };

    const handleCharge = () => {
        setShowPaymentModal(true);
        setPaymentStep('waiting');
    };

    const formatPrice = (price) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        return {
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="flex flex-1 h-full bg-gray-100">
            {/* Main Content */}
            <div className="flex flex-1">
                {/* Products Section */}
                <div className="w-full p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Menu</h1>

                        {/* Search and Sort */}
                        <div className="flex space-x-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <SortAsc size={20} />
                                <span>Sort</span>
                            </button>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-lg hover:shadow-lg cursor-pointer transition-shadow"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="relative mb-3">
                                        <div className="w-full h-32 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">🍫</div>
                                            </div>
                                        </div>
                                        {product.isFavorite && (
                                            <Heart className="absolute top-2 right-2 text-red-500 fill-current" size={20} />
                                        )}
                                    </div>
                                    <h3 className="font-medium text-gray-800 text-center">{product.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Section */}
                <div className="w-2/3 bg-white shadow-lg border border-gray-200 p-6">
                    {/* Customer Info */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <span className="font-medium">{customerName}</span>
                            </div>
                            <button className="p-2 border border-gray-200 rounded-lg">
                                <Plus size={16} />
                                <span className="ml-1 text-sm">Add Table</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Order Type:</span>
                            <div className="flex items-center space-x-1">
                                <span className="font-medium">{orderType}</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-3 mb-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">x {item.quantity}</div>
                                </div>
                                <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Calculations */}
                    <div className="space-y-2 mb-6 pb-4 border-b border-gray-200">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Tip Server (3%)</span>
                            <span>{formatPrice(calculateTax(calculateSubtotal(), 0.03))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Pajak Restoran (10%)</span>
                            <span>{formatPrice(calculateTax(calculateSubtotal(), 0.10))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>PPN (10%)</span>
                            <span>{formatPrice(calculateTax(calculateSubtotal(), 0.10))}</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold mb-6">
                        <span>Total:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium">
                            Clear Sale
                        </button>
                        <button
                            onClick={handleCharge}
                            className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700"
                        >
                            Charge {formatPrice(calculateTotal())}
                        </button>
                    </div>

                    {/* Bottom Icons */}
                    <div className="flex justify-end space-x-2 mt-4">
                        <button className="p-2 border border-gray-200 rounded">
                            <Printer size={20} />
                        </button>
                        <button className="p-2 border border-gray-200 rounded">
                            <Share size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Item Detail Modal */}
            {showItemModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="px-4 py-2 border border-gray-200 text-blue-500 rounded-lg"
                            >
                                Cancel
                            </button>
                            <h2 className="text-lg font-bold">Ice Cream - Rp 16.000</h2>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                Save
                            </button>
                        </div>

                        {/* Variants */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Variant | Choose one</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['Chocolate', 'Tiramisu', 'Cookies n Cream', 'Matcha'].map((variant) => (
                                    <button
                                        key={variant}
                                        className={`p-3 rounded-lg border ${selectedItem.variant === variant
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Quantity</h3>
                            <div className="flex items-center space-x-4">
                                <button className="p-2 border border-gray-200 rounded">
                                    <Minus size={16} />
                                </button>
                                <input
                                    type="number"
                                    value={selectedItem.quantity}
                                    className="w-16 p-2 border border-gray-200 rounded text-center"
                                    readOnly
                                />
                                <button className="p-2 border border-gray-200 rounded">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Discounts */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Discounts</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: 'member', label: 'Member (10%)' },
                                    { key: 'buyOneGetOne', label: 'Buy 1 Get 1 (100%)' },
                                    { key: 'dineIn', label: 'Dine In (15%)' },
                                    { key: 'owner', label: 'Owner (20%)' },
                                    { key: 'opening', label: 'Opening (30%)' },
                                    { key: 'compliment', label: 'Compliment (100%)' }
                                ].map((discount) => (
                                    <div key={discount.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <span className="text-sm">{discount.label}</span>
                                        <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sales Type */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Sales Type | Choose one</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="p-3 bg-blue-600 text-white rounded-lg">Dine In</button>
                                <button className="p-3 bg-gray-200 text-gray-700 rounded-lg">Take Away</button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="font-medium mb-3">Notes</h3>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                                rows="3"
                                placeholder="Add notes..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-96 max-w-full mx-4 text-center">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 border border-gray-200 text-blue-500 rounded-lg"
                            >
                                Cancel
                            </button>
                            <h2 className="text-lg font-bold">PAYMENT</h2>
                            {paymentStep === 'success' && (
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    Next
                                </button>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">Total Payment</h3>
                            <div className="text-2xl font-bold text-gray-800">{formatPrice(calculateTotal())}</div>
                        </div>

                        <div className="mb-8">
                            <div className="relative">
                                {/* Payment Device Illustration */}
                                <div className="w-32 h-20 mx-auto mb-4 bg-gray-400 rounded-lg relative">
                                    <div className="absolute top-2 left-2 w-8 h-6 bg-white rounded"></div>
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full"></div>
                                </div>
                                {/* Hand Illustration */}
                                <div className="absolute -top-4 right-20">
                                    <div className="w-12 h-8 bg-yellow-200 rounded-full transform rotate-12"></div>
                                </div>
                                {/* Success Check */}
                                {paymentStep === 'success' && (
                                    <div className="absolute -bottom-2 right-16">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="text-white" size={16} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-500">
                            {paymentStep === 'waiting'
                                ? 'Waiting for your customer to scan their palm to make a payment'
                                : 'Payment Success!'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="text-white" size={24} />
                            </div>
                            <h2 className="text-lg font-bold text-green-600">Transaction Success!</h2>
                        </div>

                        {/* Receipt */}
                        <div className="bg-white border-2 border-dashed border-gray-200 p-4 rounded-lg">
                            <div className="text-center border-b border-gray-200 pb-4 mb-4">
                                <div className="text-sm text-gray-500">{getCurrentDateTime().date}</div>
                                <div className="text-sm text-gray-500">{getCurrentDateTime().time}</div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span>Receipt Number</span>
                                    <span>3RMNW3N</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Customer</span>
                                    <span>Mary Rain</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Cashier</span>
                                    <span>Ella Watson</span>
                                </div>
                            </div>

                            <div className="text-center font-medium mb-4">{orderType}</div>

                            <div className="space-y-2 mb-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.name}</span>
                                        <div className="flex space-x-4">
                                            <span>x {item.quantity}</span>
                                            <span>{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-2 space-y-1">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(calculateSubtotal())}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Tip Server (3%)</span>
                                    <span>{formatPrice(calculateTax(calculateSubtotal(), 0.03))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Pajak Restoran (10%)</span>
                                    <span>{formatPrice(calculateTax(calculateSubtotal(), 0.10))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>PPN (10%)</span>
                                    <span>{formatPrice(calculateTax(calculateSubtotal(), 0.10))}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                                    <span>Total:</span>
                                    <span>{formatPrice(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button className="flex-1 flex items-center justify-center space-x-2 py-3 border border-gray-200 text-blue-500 rounded-lg">
                                <Share size={16} />
                                <span>Send Receipt</span>
                            </button>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosMainPage;