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
    Printer,
    Filter
} from 'lucide-react';

// Firebase imports (adjust path as needed)
import db from '../lib/firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

const PointOfSaleNew = () => {

    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showItemModal, setShowItemModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [paymentStep, setPaymentStep] = useState('waiting');
    const [customerName, setCustomerName] = useState('Customer Name');
    const [orderType, setOrderType] = useState('Dine in');
    const [transactionStatus, setTransactionStatus] = useState(null); // 'pending' | 'success' | null

    // Fetch categories from Firebase
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesRef = collection(db, 'categories');
                const categoriesSnapshot = await getDocs(categoriesRef);
                const categoriesData = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch products from Firebase with real-time updates
    useEffect(() => {
        const itemsRef = collection(db, 'items');
        const q = query(
            itemsRef,
            where('isActive', '==', true)
            // orderBy('name')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(itemsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching items:', error);
            setError('Failed to load items');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter products based on category and search term
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch && product.stock > 0;
    });

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

    // Effect to handle showing receipt modal after success illustration
    useEffect(() => {
        let timer;
        if (showPaymentModal && transactionStatus === 'success') {
            timer = setTimeout(() => {
                setShowPaymentModal(false);
                setShowReceiptModal(true);
                setTransactionStatus(null);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [showPaymentModal, transactionStatus]);

    const handleProductClick = (product) => {
        setSelectedItem({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            categoryId: product.categoryId,
            variant: 'Default',
            quantity: 1,
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

    const handleAddToCart = async () => {
        if (!selectedItem) return;

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item =>
            item.id === selectedItem.id &&
            item.variant === selectedItem.variant
        );

        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].quantity += selectedItem.quantity;
            setCart(updatedCart);
        } else {
            // Add new item to cart
            setCart(prev => [...prev, {
                id: selectedItem.id,
                name: selectedItem.name,
                price: selectedItem.price,
                quantity: selectedItem.quantity,
                variant: selectedItem.variant,
                notes: selectedItem.notes,
                salesType: selectedItem.salesType
            }]);
        }

        setShowItemModal(false);
        setSelectedItem(null);
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(prev => prev.filter(item => item.id !== id));
        } else {
            setCart(prev => prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateStock = async (itemId, quantityPurchased) => {
        try {
            const itemRef = doc(db, 'items', itemId);
            const currentItem = products.find(p => p.id === itemId);
            if (currentItem) {
                await updateDoc(itemRef, {
                    stock: currentItem.stock - quantityPurchased
                });
            }
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTax = (subtotal, rate) => {
        return Math.round(subtotal * rate);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tipServer = calculateTax(subtotal, 0.03);
        const pajakRestoran = calculateTax(subtotal, 0.10);
        const ppn = calculateTax(subtotal, 0.10);
        return subtotal + tipServer + pajakRestoran + ppn;
    };

    const handleCharge = async () => {
        // Update stock for each item in cart
        for (const item of cart) {
            await updateStock(item.id, item.quantity);
        }

        // Prepare transaction data
        const transactionData = {
            items: cart,
            customerName,
            orderType,
            total: calculateTotal(),
            subtotal: calculateSubtotal(),
            tipServer: calculateTax(calculateSubtotal(), 0.03),
            pajakRestoran: calculateTax(calculateSubtotal(), 0.10),
            ppn: calculateTax(calculateSubtotal(), 0.10),
            status: 'pending',
            createdAt: new Date(),
        };

        // Add transaction to Firestore
        let transactionRef;
        try {
            transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
            setShowPaymentModal(true);
            setPaymentStep('waiting');
            setTransactionStatus('pending');

            // After 20 seconds, update the status to 'success'
            setTimeout(async () => {
                await updateDoc(doc(db, 'transactions', transactionRef.id), {
                    status: 'success'
                });
                setTransactionStatus('success');
            }, 20000);
        } catch (err) {
            console.error('Error adding transaction:', err);
        }
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

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    if (loading) {
        return (
            <div className="flex flex-1 h-full bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 h-full bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Main Content */}
            <div className="flex flex-1">
                {/* Products Section */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Menu</h1>

                        {/* Search and Filter */}
                        <div className="flex space-x-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-500">No products found</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <div className="relative mb-3">
                                            <div className="w-full h-32 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-4xl mb-2">🍽️</div>
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                                                Stock: {product.stock}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">{getCategoryName(product.categoryId)}</p>
                                            <p className="font-bold text-blue-600">{formatPrice(product.price)}</p>
                                            {product.description && (
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Cart Section */}
                <div className="w-96 bg-white shadow-lg border-l border-gray-200 p-6 flex flex-col">
                    {/* Customer Info */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="font-medium bg-transparent border-none outline-none"
                                />
                            </div>
                            {/* <button className="flex p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <Plus size={16} />
                                <span className="ml-1 text-sm">Add Table</span>
                            </button> */}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Order Type:</span>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="font-medium bg-transparent border-none outline-none cursor-pointer"
                            >
                                <option value="Dine in">Dine in</option>
                                <option value="Take Away">Take Away</option>
                                <option value="Delivery">Delivery</option>
                            </select>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-3 mb-6">
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-gray-500">Cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={`${item.id}-${item.variant}-${item.salesType}-${index}`} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {item.variant !== 'Default' && `${item.variant} • `}
                                                {item.salesType} • {formatPrice(item.price)} each
                                            </div>
                                            {item.notes && (
                                                <div className="text-xs text-gray-400 mt-1">Note: {item.notes}</div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.variant, item.salesType, item.quantity - 1)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.variant, item.salesType, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="font-medium w-20 text-right ml-4">{formatPrice(item.price * item.quantity)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Calculations and Actions */}
                    <div className="border-t border-gray-200 pt-4">
                        {cart.length > 0 && (
                            <>
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
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={clearCart}
                                disabled={cart.length === 0}
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${cart.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Clear Sale
                            </button>
                            <button
                                onClick={handleCharge}
                                disabled={cart.length === 0}
                                className={`w-full py-4 rounded-lg font-medium text-lg transition-colors ${cart.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {cart.length === 0 ? 'Add items to cart' : `Charge ${formatPrice(calculateTotal())}`}
                            </button>
                        </div>

                        {/* Bottom Icons */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                                <Printer size={20} />
                            </button>
                            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                                <Share size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Detail Modal */}
            {showItemModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="px-4 py-2 border border-gray-200 text-blue-500 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <h2 className="text-lg font-bold text-center">{selectedItem.name}</h2>
                            <button
                                onClick={handleAddToCart}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Add to Cart
                            </button>
                        </div>

                        <div className="text-center mb-4">
                            <div className="text-xl font-bold text-blue-600">{formatPrice(selectedItem.price)}</div>
                        </div>

                        {/* Stock Info */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span>Available Stock:</span>
                                <span className="font-medium">{selectedItem.stock} items</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Category:</span>
                                <span className="font-medium">{getCategoryName(selectedItem.categoryId)}</span>
                            </div>
                            {selectedItem.description && (
                                <div className="text-sm text-gray-600 mt-2">{selectedItem.description}</div>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Quantity</h3>
                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => setSelectedItem(prev => ({
                                        ...prev,
                                        quantity: Math.max(1, prev.quantity - 1)
                                    }))}
                                    className="p-2 border border-gray-200 rounded hover:bg-gray-50"
                                >
                                    <Minus size={16} />
                                </button>
                                <input
                                    type="number"
                                    value={selectedItem.quantity}
                                    onChange={(e) => {
                                        const value = Math.min(selectedItem.stock, Math.max(1, parseInt(e.target.value) || 1));
                                        setSelectedItem(prev => ({ ...prev, quantity: value }));
                                    }}
                                    max={selectedItem.stock}
                                    min="1"
                                    className="w-16 p-2 border border-gray-200 rounded text-center"
                                />
                                <button
                                    onClick={() => setSelectedItem(prev => ({
                                        ...prev,
                                        quantity: Math.min(selectedItem.stock, prev.quantity + 1)
                                    }))}
                                    className="p-2 border border-gray-200 rounded hover:bg-gray-50"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                                Max: {selectedItem.stock} available
                            </p>
                        </div>

                        {/* Sales Type */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Sales Type</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSelectedItem(prev => ({ ...prev, salesType: 'Dine In' }))}
                                    className={`p-3 rounded-lg transition-colors ${selectedItem.salesType === 'Dine In' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Dine In
                                </button>
                                <button
                                    onClick={() => setSelectedItem(prev => ({ ...prev, salesType: 'Take Away' }))}
                                    className={`p-3 rounded-lg transition-colors ${selectedItem.salesType === 'Take Away' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Take Away
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="font-medium mb-3">Notes</h3>
                            <textarea
                                value={selectedItem.notes}
                                onChange={(e) => setSelectedItem(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                                rows="3"
                                placeholder="Add notes..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md text-center">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-center">PAYMENT</h2>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">Total Payment</h3>
                            <div className="text-2xl font-bold text-gray-800">{formatPrice(calculateTotal())}</div>
                        </div>
                        <div className="mb-8 relative flex items-center justify-center min-h-[100px]">
                            {/* Payment Device Illustration (pending) or Success Illustration (success) */}
                            {transactionStatus === 'pending' && (
                                <div className="w-32 h-20 mx-auto mb-4 bg-gray-400 rounded-lg relative">
                                    <div className="absolute top-2 left-2 w-8 h-6 bg-white rounded"></div>
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full"></div>
                                    {/* Hand Illustration */}
                                    <div className="absolute -top-4 right-20">
                                        <div className="w-12 h-8 bg-yellow-200 rounded-full transform rotate-12"></div>
                                    </div>
                                </div>
                            )}
                            {transactionStatus === 'success' && (
                                <div className="w-32 h-20 mx-auto mb-4 bg-gray-400 rounded-lg relative">
                                    <div className="absolute top-2 left-2 w-8 h-6 bg-white rounded"></div>
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full"></div>
                                    {/* Success Check */}
                                    <div className="absolute -bottom-2 right-16">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="text-white" size={16} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-500">
                            {transactionStatus === 'pending'
                                ? 'Waiting for your customer to scan their palm to make a payment'
                                : transactionStatus === 'success'
                                    ? 'Payment Success!'
                                    : ''}
                        </p>
                    </div>
                </div>
            )}
            {/* Receipt Modal (from PointOfSale.jsx) */}
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
                                    <span>{customerName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Cashier</span>
                                    <span>Ella Watson</span>
                                </div>
                            </div>
                            <div className="text-center font-medium mb-4">{orderType}</div>
                            <div className="space-y-2 mb-4">
                                {cart.map((item, idx) => (
                                    <div key={item.id + '-' + idx} className="flex justify-between text-sm">
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
    )
}

export default PointOfSaleNew;