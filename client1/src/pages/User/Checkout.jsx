import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    const [shippingInfo, setShippingInfo] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India' // Changed default to India
    });

    const [paymentInfo, setPaymentInfo] = useState({
        method: 'Credit Card',
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    const [orderNotes, setOrderNotes] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('/api/users/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.length === 0) {
                toast.error('Your cart is empty');
                navigate('/cart');
                return;
            }

            setCartItems(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error('Failed to load cart items');
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        
        // Reset state when country changes
        if (name === 'country') {
            setShippingInfo({
                ...shippingInfo,
                [name]: value,
                state: '', // Reset state when country changes
                zipCode: '' // Reset zip code when country changes
            });
        } else {
            setShippingInfo({
                ...shippingInfo,
                [name]: value
            });
        }
    };

    const handlePaymentChange = (e) => {
        let { name, value } = e.target;
        
        // Format card number
        if (name === 'cardNumber') {
            value = formatCardNumber(value);
        }
        
        // Format CVV
        if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 4);
        }

        setPaymentInfo({
            ...paymentInfo,
            [name]: value
        });
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const applyPromoCode = async () => {
        if (!promoCode.trim()) {
            toast.error('Please enter a promo code');
            return;
        }

        try {
            // Mock promo code validation
            const promoCodes = {
                'SAVE10': 10,
                'WELCOME15': 15,
                'STUDENT20': 20,
                'SUMMER25': 25,
                'FIRST30': 30
            };

            const upperCode = promoCode.toUpperCase();
            if (promoCodes[upperCode]) {
                setDiscount(promoCodes[upperCode]);
                toast.success(`Promo code applied! ${promoCodes[upperCode]}% discount`);
            } else {
                toast.error('Invalid promo code');
            }
        } catch (error) {
            toast.error('Failed to apply promo code');
        }
    };

    const removePromoCode = () => {
        setDiscount(0);
        setPromoCode('');
        toast.success('Promo code removed');
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0
        );
    };

    const calculateDiscount = () => {
        return (calculateSubtotal() * discount) / 100;
    };

    const calculateTax = () => {
        const subtotal = calculateSubtotal() - calculateDiscount();
        // Different tax rates for different countries
        const taxRate = shippingInfo.country === 'India' ? 0.18 : 0.08; // 18% GST for India, 8% for others
        return subtotal * taxRate;
    };

    const calculateShipping = () => {
        const subtotal = calculateSubtotal() - calculateDiscount();
        // Different shipping rates for different countries
        if (shippingInfo.country === 'India') {
            return subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
        } else {
            return subtotal >= 50 ? 0 : 9.99; // Free shipping above $50
        }
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount() + calculateTax() + calculateShipping();
    };

    const validateShipping = () => {
        const required = ['street', 'city', 'state', 'zipCode'];
        for (let field of required) {
            if (!shippingInfo[field].trim()) {
                toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                return false;
            }
        }
        
        // Validate postal code format based on country
        if (shippingInfo.country === 'India') {
            if (!shippingInfo.zipCode.match(/^\d{6}$/)) {
                toast.error('Please enter a valid 6-digit PIN code');
                return false;
            }
        } else if (shippingInfo.country === 'United States') {
            if (!shippingInfo.zipCode.match(/^\d{5}(-\d{4})?$/)) {
                toast.error('Please enter a valid ZIP code');
                return false;
            }
        } else if (shippingInfo.country === 'Canada') {
            if (!shippingInfo.zipCode.match(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)) {
                toast.error('Please enter a valid Canadian postal code');
                return false;
            }
        }
        
        return true;
    };

    const validatePayment = () => {
        if (paymentInfo.method === 'Cash on Delivery') {
            return true;
        }

        const { cardNumber, cardName, expiryMonth, expiryYear, cvv } = paymentInfo;
        
        if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
            toast.error('Please enter a valid 16-digit card number');
            return false;
        }
        
        if (!cardName.trim()) {
            toast.error('Cardholder name is required');
            return false;
        }
        
        if (!expiryMonth || !expiryYear) {
            toast.error('Card expiry date is required');
            return false;
        }
        
        // Check if card is not expired
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        if (parseInt(expiryYear) < currentYear || 
            (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
            toast.error('Card has expired');
            return false;
        }
        
        if (!cvv.match(/^\d{3,4}$/)) {
            toast.error('Please enter a valid CVV');
            return false;
        }

        return true;
    };

    const proceedToNextStep = () => {
        if (currentStep === 1) {
            if (!validateShipping()) return;
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!validatePayment()) return;
            setCurrentStep(3);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const placeOrder = async () => {
        if (!agreeToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        setProcessing(true);

        try {
            const token = localStorage.getItem('token');
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    price: item.product.price
                })),
                totalAmount: calculateTotal(),
                shippingAddress: shippingInfo,
                paymentMethod: paymentInfo.method,
                orderNotes,
                promoCode: discount > 0 ? promoCode : null,
                discount: calculateDiscount()
            };

            const response = await axios.post('/api/orders', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Order placed successfully!');
            
            // Simulate payment processing delay
            setTimeout(() => {
                navigate('/orders', { 
                    state: { 
                        orderPlaced: true, 
                        orderId: response.data.order._id 
                    } 
                });
            }, 2000);

        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getCurrentYear = () => new Date().getFullYear();
    
    const generateYearOptions = () => {
        const years = [];
        const currentYear = getCurrentYear();
        for (let i = 0; i <= 10; i++) {
            years.push(currentYear + i);
        }
        return years;
    };

    const getCurrencySymbol = () => {
        return shippingInfo.country === 'India' ? '₹' : '$';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading checkout...</p>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-header">
                    <h1 className="page-title">Secure Checkout</h1>
                    <div className="checkout-steps">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Shipping</span>
                        </div>
                        <div className="step-connector"></div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Payment</span>
                        </div>
                        <div className="step-connector"></div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span className="step-label">Review</span>
                        </div>
                    </div>
                </div>

                <div className="checkout-content">
                    <div className="checkout-form">
                        {/* Step 1: Shipping Information */}
                        {currentStep === 1 && (
                            <div className="form-section shipping-section">
                                <h2 className="section-title">
                                    <span className="title-icon">🚚</span>
                                    Shipping Information
                                </h2>
                                
                                <div className="shipping-form">
                                    <div className="form-group">
                                        <label className="form-label">Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingInfo.street}
                                            onChange={handleShippingChange}
                                            className="form-input"
                                            placeholder={shippingInfo.country === 'India' ? 
                                                "123 MG Road, Apartment 4B" : 
                                                "123 Main Street, Apt 4B"
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingInfo.city}
                                                onChange={handleShippingChange}
                                                className="form-input"
                                                placeholder={shippingInfo.country === 'India' ? 
                                                    "Mumbai" : 
                                                    "New York"
                                                }
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">State *</label>
                                            <select
                                                name="state"
                                                value={shippingInfo.state}
                                                onChange={handleShippingChange}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select State</option>
                                                
                                                {/* US States */}
                                                {shippingInfo.country === 'United States' && (
                                                    <>
                                                        <option value="AL">Alabama</option>
                                                        <option value="AK">Alaska</option>
                                                        <option value="AZ">Arizona</option>
                                                        <option value="AR">Arkansas</option>
                                                        <option value="CA">California</option>
                                                        <option value="CO">Colorado</option>
                                                        <option value="CT">Connecticut</option>
                                                        <option value="DE">Delaware</option>
                                                        <option value="FL">Florida</option>
                                                        <option value="GA">Georgia</option>
                                                        <option value="HI">Hawaii</option>
                                                        <option value="ID">Idaho</option>
                                                        <option value="IL">Illinois</option>
                                                        <option value="IN">Indiana</option>
                                                        <option value="IA">Iowa</option>
                                                        <option value="KS">Kansas</option>
                                                        <option value="KY">Kentucky</option>
                                                        <option value="LA">Louisiana</option>
                                                        <option value="ME">Maine</option>
                                                        <option value="MD">Maryland</option>
                                                        <option value="MA">Massachusetts</option>
                                                        <option value="MI">Michigan</option>
                                                        <option value="MN">Minnesota</option>
                                                        <option value="MS">Mississippi</option>
                                                        <option value="MO">Missouri</option>
                                                        <option value="MT">Montana</option>
                                                        <option value="NE">Nebraska</option>
                                                        <option value="NV">Nevada</option>
                                                        <option value="NH">New Hampshire</option>
                                                        <option value="NJ">New Jersey</option>
                                                        <option value="NM">New Mexico</option>
                                                        <option value="NY">New York</option>
                                                        <option value="NC">North Carolina</option>
                                                        <option value="ND">North Dakota</option>
                                                        <option value="OH">Ohio</option>
                                                        <option value="OK">Oklahoma</option>
                                                        <option value="OR">Oregon</option>
                                                        <option value="PA">Pennsylvania</option>
                                                        <option value="RI">Rhode Island</option>
                                                        <option value="SC">South Carolina</option>
                                                        <option value="SD">South Dakota</option>
                                                        <option value="TN">Tennessee</option>
                                                        <option value="TX">Texas</option>
                                                        <option value="UT">Utah</option>
                                                        <option value="VT">Vermont</option>
                                                        <option value="VA">Virginia</option>
                                                        <option value="WA">Washington</option>
                                                        <option value="WV">West Virginia</option>
                                                        <option value="WI">Wisconsin</option>
                                                        <option value="WY">Wyoming</option>
                                                    </>
                                                )}

                                                {/* Canadian Provinces */}
                                                {shippingInfo.country === 'Canada' && (
                                                    <>
                                                        <option value="AB">Alberta</option>
                                                        <option value="BC">British Columbia</option>
                                                        <option value="MB">Manitoba</option>
                                                        <option value="NB">New Brunswick</option>
                                                        <option value="NL">Newfoundland and Labrador</option>
                                                        <option value="NS">Nova Scotia</option>
                                                        <option value="ON">Ontario</option>
                                                        <option value="PE">Prince Edward Island</option>
                                                        <option value="QC">Quebec</option>
                                                        <option value="SK">Saskatchewan</option>
                                                        <option value="NT">Northwest Territories</option>
                                                        <option value="NU">Nunavut</option>
                                                        <option value="YT">Yukon</option>
                                                    </>
                                                )}

                                                {/* Indian States */}
                                                {shippingInfo.country === 'India' && (
                                                    <>
                                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                                        <option value="Assam">Assam</option>
                                                        <option value="Bihar">Bihar</option>
                                                        <option value="Chhattisgarh">Chhattisgarh</option>
                                                        <option value="Goa">Goa</option>
                                                        <option value="Gujarat">Gujarat</option>
                                                        <option value="Haryana">Haryana</option>
                                                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                                                        <option value="Jharkhand">Jharkhand</option>
                                                        <option value="Karnataka">Karnataka</option>
                                                        <option value="Kerala">Kerala</option>
                                                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                        <option value="Maharashtra">Maharashtra</option>
                                                        <option value="Manipur">Manipur</option>
                                                        <option value="Meghalaya">Meghalaya</option>
                                                        <option value="Mizoram">Mizoram</option>
                                                        <option value="Nagaland">Nagaland</option>
                                                        <option value="Odisha">Odisha</option>
                                                        <option value="Punjab">Punjab</option>
                                                        <option value="Rajasthan">Rajasthan</option>
                                                        <option value="Sikkim">Sikkim</option>
                                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                                        <option value="Telangana">Telangana</option>
                                                        <option value="Tripura">Tripura</option>
                                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                        <option value="Uttarakhand">Uttarakhand</option>
                                                        <option value="West Bengal">West Bengal</option>
                                                        <option value="Delhi">Delhi</option>
                                                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                                        <option value="Ladakh">Ladakh</option>
                                                        <option value="Puducherry">Puducherry</option>
                                                        <option value="Chandigarh">Chandigarh</option>
                                                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                                        <option value="Lakshadweep">Lakshadweep</option>
                                                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">
                                                {shippingInfo.country === 'India' ? 'PIN Code *' : 
                                                 shippingInfo.country === 'Canada' ? 'Postal Code *' : 
                                                 'ZIP Code *'}
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={shippingInfo.zipCode}
                                                onChange={handleShippingChange}
                                                className="form-input"
                                                placeholder={
                                                    shippingInfo.country === 'India' ? '400001' :
                                                    shippingInfo.country === 'Canada' ? 'K1A 0A6' :
                                                    '12345'
                                                }
                                                maxLength={shippingInfo.country === 'India' ? '6' : '10'}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Country *</label>
                                        <select
                                            name="country"
                                            value={shippingInfo.country}
                                            onChange={handleShippingChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="India">India</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                        </select>
                                    </div>

                                    <div className="shipping-options">
                                        <h3>Shipping Options</h3>
                                        <div className="shipping-option">
                                            <input type="radio" id="standard" name="shipping" defaultChecked />
                                            <label htmlFor="standard">
                                                <span className="option-name">Standard Shipping</span>
                                                <span className="option-price">
                                                    {calculateShipping() === 0 ? 'FREE' : 
                                                     `${getCurrencySymbol()}${calculateShipping().toFixed(2)}`}
                                                </span>
                                                <span className="option-time">
                                                    {shippingInfo.country === 'India' ? '3-7 business days' : '5-7 business days'}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="shipping-option">
                                            <input type="radio" id="express" name="shipping" />
                                            <label htmlFor="express">
                                                <span className="option-name">Express Shipping</span>
                                                <span className="option-price">
                                                    {shippingInfo.country === 'India' ? '₹199' : '$15.99'}
                                                </span>
                                                <span className="option-time">
                                                    {shippingInfo.country === 'India' ? '1-3 business days' : '2-3 business days'}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="shipping-option">
                                            <input type="radio" id="overnight" name="shipping" />
                                            <label htmlFor="overnight">
                                                <span className="option-name">Overnight Shipping</span>
                                                <span className="option-price">
                                                    {shippingInfo.country === 'India' ? '₹399' : '$29.99'}
                                                </span>
                                                <span className="option-time">Next business day</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Information */}
                        {currentStep === 2 && (
                            <div className="form-section payment-section">
                                <h2 className="section-title">
                                    <span className="title-icon">💳</span>
                                    Payment Information
                                </h2>

                                <div className="payment-methods">
                                    <div className="method-tabs">
                                        <button 
                                            className={`method-tab ${paymentInfo.method === 'Credit Card' ? 'active' : ''}`}
                                            onClick={() => setPaymentInfo({...paymentInfo, method: 'Credit Card'})}
                                        >
                                            <span className="tab-icon">💳</span>
                                            Credit Card
                                        </button>
                                        <button 
                                            className={`method-tab ${paymentInfo.method === 'Debit Card' ? 'active' : ''}`}
                                            onClick={() => setPaymentInfo({...paymentInfo, method: 'Debit Card'})}
                                        >
                                            <span className="tab-icon">💸</span>
                                            Debit Card
                                        </button>
                                        <button 
                                            className={`method-tab ${paymentInfo.method === 'Cash on Delivery' ? 'active' : ''}`}
                                            onClick={() => setPaymentInfo({...paymentInfo, method: 'Cash on Delivery'})}
                                        >
                                            <span className="tab-icon">💰</span>
                                            Cash on Delivery
                                        </button>
                                        {shippingInfo.country === 'India' && (
                                            <button 
                                                className={`method-tab ${paymentInfo.method === 'UPI' ? 'active' : ''}`}
                                                onClick={() => setPaymentInfo({...paymentInfo, method: 'UPI'})}
                                            >
                                                <span className="tab-icon">📱</span>
                                                UPI
                                            </button>
                                        )}
                                    </div>

                                    {(paymentInfo.method === 'Credit Card' || paymentInfo.method === 'Debit Card') && (
                                        <div className="card-form">
                                            <div className="form-group">
                                                <label className="form-label">Card Number *</label>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    value={paymentInfo.cardNumber}
                                                    onChange={handlePaymentChange}
                                                    className="form-input"
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    required
                                                />
                                                <div className="card-icons">
                                                    <span className="card-icon">💳</span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Cardholder Name *</label>
                                                <input
                                                    type="text"
                                                    name="cardName"
                                                    value={paymentInfo.cardName}
                                                    onChange={handlePaymentChange}
                                                    className="form-input"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Expiry Month *</label>
                                                    <select
                                                        name="expiryMonth"
                                                        value={paymentInfo.expiryMonth}
                                                        onChange={handlePaymentChange}
                                                        className="form-select"
                                                        required
                                                    >
                                                        <option value="">Month</option>
                                                        {Array.from({length: 12}, (_, i) => (
                                                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                                {String(i + 1).padStart(2, '0')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Expiry Year *</label>
                                                    <select
                                                        name="expiryYear"
                                                        value={paymentInfo.expiryYear}
                                                        onChange={handlePaymentChange}
                                                        className="form-select"
                                                        required
                                                    >
                                                        <option value="">Year</option>
                                                        {generateYearOptions().map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">CVV *</label>
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        value={paymentInfo.cvv}
                                                        onChange={handlePaymentChange}
                                                        className="form-input"
                                                        placeholder="123"
                                                        maxLength="4"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentInfo.method === 'UPI' && (
                                        <div className="upi-info">
                                            <div className="upi-card">
                                                <h3>UPI Payment</h3>
                                                <p>Pay using your UPI ID or scan QR code</p>
                                                <div className="upi-options">
                                                    <div className="upi-option">
                                                        <input type="radio" id="upi-id" name="upi-method" defaultChecked />
                                                        <label htmlFor="upi-id">Enter UPI ID</label>
                                                    </div>
                                                    <div className="upi-option">
                                                        <input type="radio" id="upi-qr" name="upi-method" />
                                                        <label htmlFor="upi-qr">Scan QR Code</label>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Enter UPI ID (e.g., user@paytm)"
                                                    className="form-input upi-input"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentInfo.method === 'Cash on Delivery' && (
                                        <div className="cod-info">
                                            <div className="cod-card">
                                                <h3>Cash on Delivery</h3>
                                                <p>Pay when your order is delivered to your doorstep.</p>
                                                <ul>
                                                    <li>✅ No advance payment required</li>
                                                    <li>✅ Pay in cash to delivery person</li>
                                                    <li>✅ Inspect products before payment</li>
                                                    <li>⚠️ Additional COD charges may apply</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {currentStep === 3 && (
                            <div className="form-section review-section">
                                <h2 className="section-title">
                                    <span className="title-icon">📋</span>
                                    Review Your Order
                                </h2>

                                <div className="review-content">
                                    <div className="review-items">
                                        <h3>Order Items</h3>
                                        {cartItems.map(item => (
                                            <div key={item._id} className="review-item">
                                                <img 
                                                    src={item.product.image} 
                                                    alt={item.product.name}
                                                    className="item-image"
                                                />
                                                <div className="item-details">
                                                    <h4>{item.product.name}</h4>
                                                    <p>{item.product.brand}</p>
                                                    <p>Size: {item.size} | Color: {item.color}</p>
                                                    <p>Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="item-price">
                                                    {getCurrencySymbol()}{(item.product.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="review-addresses">
                                        <div className="address-section">
                                            <h3>Shipping Address</h3>
                                            <div className="address-card">
                                                <p>{shippingInfo.street}</p>
                                                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                                                <p>{shippingInfo.country}</p>
                                            </div>
                                        </div>

                                        <div className="address-section">
                                            <h3>Payment Method</h3>
                                            <div className="payment-card">
                                                <p>{paymentInfo.method}</p>
                                                {paymentInfo.method !== 'Cash on Delivery' && paymentInfo.method !== 'UPI' && (
                                                    <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-notes-section">
                                        <label className="form-label">Order Notes (Optional)</label>
                                        <textarea
                                            value={orderNotes}
                                            onChange={(e) => setOrderNotes(e.target.value)}
                                            className="form-textarea"
                                            placeholder="Any special instructions for your order..."
                                            rows="3"
                                        />
                                    </div>

                                    <div className="terms-section">
                                        <label className="checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={agreeToTerms}
                                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                                className="checkbox"
                                            />
                                            <span className="checkmark"></span>
                                            I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="form-navigation">
                            {currentStep > 1 && (
                                <button 
                                    className="nav-btn prev-btn"
                                    onClick={goToPreviousStep}
                                >
                                    ← Previous
                                </button>
                            )}
                            
                            <Link to="/cart" className="back-to-cart">
                                ← Back to Cart
                            </Link>

                            {currentStep < 3 ? (
                                <button 
                                    className="nav-btn next-btn"
                                    onClick={proceedToNextStep}
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button 
                                    className="nav-btn place-order-btn"
                                    onClick={placeOrder}
                                    disabled={processing || !agreeToTerms}
                                >
                                    {processing ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            🔒 Place Order - {getCurrencySymbol()}{calculateTotal().toFixed(2)}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="order-summary">
                        <div className="summary-card">
                            <h3 className="summary-title">Order Summary</h3>
                            
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item._id} className="summary-item">
                                        <img 
                                            src={item.product.image} 
                                            alt={item.product.name}
                                            className="summary-item-image"
                                        />
                                        <div className="summary-item-details">
                                            <span className="item-name">{item.product.name}</span>
                                            <span className="item-quantity">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="item-total">
                                            {getCurrencySymbol()}{(item.product.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="promo-section">
                                <h4>Promo Code</h4>
                                {discount > 0 ? (
                                    <div className="applied-promo">
                                        <span className="promo-code">{promoCode}</span>
                                        <span className="promo-discount">-{discount}%</span>
                                        <button 
                                            className="remove-promo"
                                            onClick={removePromoCode}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="promo-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="Enter code"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="promo-input"
                                        />
                                        <button 
                                            className="apply-promo-btn"
                                            onClick={applyPromoCode}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="summary-calculations">
                                <div className="calc-row">
                                    <span>Subtotal</span>
                                    <span>{getCurrencySymbol()}{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                
                                {discount > 0 && (
                                    <div className="calc-row discount-row">
                                        <span>Discount ({discount}%)</span>
                                        <span>-{getCurrencySymbol()}{calculateDiscount().toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <div className="calc-row">
                                    <span>Shipping</span>
                                    <span>
                                        {calculateShipping() === 0 ? 'FREE' : 
                                         `${getCurrencySymbol()}${calculateShipping().toFixed(2)}`}
                                    </span>
                                </div>
                                
                                <div className="calc-row">
                                    <span>
                                        {shippingInfo.country === 'India' ? 'GST (18%)' : 'Tax (8%)'}
                                    </span>
                                    <span>{getCurrencySymbol()}{calculateTax().toFixed(2)}</span>
                                </div>
                                
                                <div className="calc-divider"></div>
                                
                                <div className="calc-row total-row">
                                    <span>Total</span>
                                    <span>{getCurrencySymbol()}{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="security-badges">
                                <div className="badge">
                                    <span className="badge-icon">🔒</span>
                                    <span>SSL Secured</span>
                                </div>
                                <div className="badge">
                                    <span className="badge-icon">🛡️</span>
                                    <span>100% Safe</span>
                                </div>
                                <div className="badge">
                                    <span className="badge-icon">💯</span>
                                    <span>Money Back Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
