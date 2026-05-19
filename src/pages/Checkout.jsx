import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const initialShippingDetails = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
};

const requiredShippingFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];

const shippingFieldLabels = {
    firstName: 'first name',
    lastName: 'last name',
    email: 'email address',
    address: 'home address',
    city: 'city',
    state: 'state',
    zipCode: 'zip code',
};

const initialPaymentDetails = {
    paymentMethod: 'card',
    billingAddress: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
};

const requiredCardFields = ['cardName', 'cardNumber', 'expiryDate', 'cvv'];

const cardFieldLabels = {
    cardName: 'name on card',
    cardNumber: 'card number',
    expiryDate: 'expiry date',
    cvv: 'CVV',
};

const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming',
];

function formatCardNumber(cardNumber) {
    return cardNumber
        .replace(/\D/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim();
}

export default function Checkout() {
    const { getCartItemsWithProducts, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const cartItems = getCartItemsWithProducts();
    const isCartEmpty = cartItems.length === 0;

    const { user } = useAuth();
    const total = getCartTotal();

    const savedAddressKey = user ? `defaultAddress_${user.email}` : null;

    function loadSavedAddress() {
        if (!savedAddressKey) return null;
        try {
            const raw = localStorage.getItem(savedAddressKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    const savedAddress = loadSavedAddress();

    const [shippingDetails, setShippingDetails] = useState(
        savedAddress ? { ...initialShippingDetails, ...savedAddress } : initialShippingDetails
    );
    const [saveAddress, setSaveAddress] = useState(!!savedAddress);
    const [paymentDetails, setPaymentDetails] = useState(initialPaymentDetails);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);
    const [activeInvalidShippingField, setActiveInvalidShippingField] = useState('');
    const [activeInvalidPaymentField, setActiveInvalidPaymentField] = useState('');

    useEffect(() => {
        const fresh = loadSavedAddress();
        if (fresh) {
            setShippingDetails((prev) => ({ ...initialShippingDetails, ...fresh }));
            setSaveAddress(true);
        } else {
            setShippingDetails(initialShippingDetails);
            setSaveAddress(false);
        }
    }, [savedAddressKey]);

    function getShippingFieldError(fieldName, value) {
        if (!requiredShippingFields.includes(fieldName)) {
            return '';
        }

        if (!value.trim()) {
            return `Please enter your ${shippingFieldLabels[fieldName]}.`;
        }

        if (fieldName === 'email') {
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
            if (!isValidEmail) {
                return 'Please enter a valid email address.';
            }
        }

        return '';
    }

    function getShippingValidationErrors(details) {
        return requiredShippingFields.reduce((errors, fieldName) => {
            const fieldError = getShippingFieldError(fieldName, details[fieldName]);
            if (fieldError) {
                errors[fieldName] = fieldError;
            }
            return errors;
        }, {});
    }

    function getPaymentFieldError(fieldName, value) {
        if (!requiredCardFields.includes(fieldName)) {
            return '';
        }

        if (!String(value).trim()) {
            return `Please enter your ${cardFieldLabels[fieldName]}.`;
        }

        return '';
    }

    function getPaymentValidationErrors(details) {
        return requiredCardFields.reduce((errors, fieldName) => {
            const fieldError = getPaymentFieldError(fieldName, details[fieldName]);
            if (fieldError) {
                errors[fieldName] = fieldError;
            }
            return errors;
        }, {});
    }

    function handleShippingBlur(event) {
        const { name } = event.target;
        const fieldError = getShippingFieldError(name, shippingDetails[name] || '');

        if (fieldError) {
            setActiveInvalidShippingField(name);
            return;
        }

        if (activeInvalidShippingField === name) {
            setActiveInvalidShippingField('');
        }
    }

    function handleShippingChange(event) {
        const { name, value } = event.target;
        setShippingDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));

        if (activeInvalidShippingField === name && value.trim()) {
            setActiveInvalidShippingField('');
        }
    }

    function handlePaymentBlur(event) {
        const { name } = event.target;
        const fieldError = getPaymentFieldError(name, paymentDetails[name] || '');

        if (fieldError) {
            setActiveInvalidPaymentField(name);
            return;
        }

        if (activeInvalidPaymentField === name) {
            setActiveInvalidPaymentField('');
        }
    }

    function handlePaymentChange(event) {
        const { name, value } = event.target;

        if (name === 'cardNumber') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
            setPaymentDetails((prevDetails) => ({
                ...prevDetails,
                cardNumber: digitsOnly,
            }));

            if (activeInvalidPaymentField === name && digitsOnly.trim()) {
                setActiveInvalidPaymentField('');
            }
            return;
        }

        setPaymentDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));

        if (activeInvalidPaymentField === name && value.trim()) {
            setActiveInvalidPaymentField('');
        }
    }

    function placeOrder(event) {
        event.preventDefault();

        if (isCartEmpty) return;

        const shippingErrors = getShippingValidationErrors(shippingDetails);
        if (Object.keys(shippingErrors).length > 0) {
            setActiveInvalidShippingField(Object.keys(shippingErrors)[0]);
            return;
        }

        if (paymentDetails.paymentMethod === 'card') {
            const paymentErrors = getPaymentValidationErrors(paymentDetails);
            if (Object.keys(paymentErrors).length > 0) {
                setActiveInvalidPaymentField(Object.keys(paymentErrors)[0]);
                return;
            }
        }

        const middleName = shippingDetails.middleName.trim();
        const fullName = [
            shippingDetails.firstName.trim(),
            middleName,
            shippingDetails.lastName.trim(),
        ]
            .filter(Boolean)
            .join(' ');

        const cardLast4 = paymentDetails.paymentMethod === "card" ? paymentDetails.cardNumber.slice(-4) : "";
        
        setOrderConfirmation({
            fullName,
            email: shippingDetails.email.trim(),
            address: shippingDetails.address.trim(),
            address2: shippingDetails.address2.trim(),
            city: shippingDetails.city.trim(),
            state: shippingDetails.state.trim(),
            zipCode: shippingDetails.zipCode.trim(),
            paymentMethod: paymentDetails.paymentMethod,
            billingAddress: paymentDetails.billingAddress.trim(),
            cardLast4,
            total,
        });
        if (savedAddressKey) {
            if (saveAddress) {
                const addressToSave = {
                    firstName: shippingDetails.firstName.trim(),
                    middleName: shippingDetails.middleName.trim(),
                    lastName: shippingDetails.lastName.trim(),
                    email: shippingDetails.email.trim(),
                    address: shippingDetails.address.trim(),
                    address2: shippingDetails.address2.trim(),
                    city: shippingDetails.city.trim(),
                    state: shippingDetails.state.trim(),
                    zipCode: shippingDetails.zipCode.trim(),
                };
                localStorage.setItem(savedAddressKey, JSON.stringify(addressToSave));
            } else {
                localStorage.removeItem(savedAddressKey);
            }
        }

        setOrderPlaced(true);
        clearCart();
        setShippingDetails(initialShippingDetails);
        setPaymentDetails(initialPaymentDetails);
        setActiveInvalidShippingField('');
        setActiveInvalidPaymentField('');
    }

    if (orderPlaced && orderConfirmation) {
        return (
            <div className="page">
                <div className="container">
                    <div className="order-success checkout-success-card">
                        <h1 className="order-success-title">Order placed successfully</h1>
                        <p className="order-success-message">
                            Thanks, {orderConfirmation.fullName}. Your simulated payment was approved and your order has been submitted.
                        </p>

                        <div className="checkout-success-summary">
                            <p><strong>Confirmation email:</strong> {orderConfirmation.email}</p>
                            <p><strong>Shipping to:</strong> {orderConfirmation.address}{orderConfirmation.address2 ? `, ${orderConfirmation.address2}` : ''}, {orderConfirmation.city}, {orderConfirmation.state} {orderConfirmation.zipCode}</p>
                            <p>
                                <strong>Payment method:</strong>{" "}
                                {{
                                    card: "Credit Card (simulated)",
                                    cash: "Cash on delivery",
                                    bank: "Bank transfer",
                                }[orderConfirmation.paymentMethod] ?? orderConfirmation.paymentMethod}
                            </p>
                            <p><strong>Billing address:</strong> {orderConfirmation.billingAddress}</p>
                            {orderConfirmation.cardLast4 ? (
                                <p><strong>Card ending in:</strong> {orderConfirmation.cardLast4}</p>
                            ) : null}
                            <p><strong>Total paid:</strong> ${orderConfirmation.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <h1 className="page-title">Checkout</h1>
                <div className="checkout-container">
                    <div className="checkout-items">
                        <h2 className="checkout-section-title">order summary</h2>
                        {cartItems.map((item) => (
                            <div className="checkout-item" key={item.id}>
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="checkout-item-image"
                                />
                                <div className="checkout-item-details">
                                    <h3 className="checkout-item-name">{item.product.name}</h3>
                                    <p className="checkout-item-price">
                                         ${item.product.price} each
                                    </p>
                                </div>
                                <div className="checkout-item-controls">
                                    <div className='quantity-controls'>
                                        <button
                                            className='quantity-btn'
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className='quantity-value'>{item.quantity}</span>
                                        <button
                                            className='quantity-btn'
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="checkout-item-total">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        className="btn btn-secondary btn-small"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form className="checkout-summary checkout-form" onSubmit={placeOrder}>
                        <h2 className='checkout-section-title'>Shipping details</h2>
                        <div className="checkout-form-grid">
                            <div className="form-group">
                                <label className="form-label" htmlFor="firstName">First name <span className="required-indicator">*</span></label>
                                <input
                                    className={`form-input ${activeInvalidShippingField === 'firstName' && getShippingFieldError('firstName', shippingDetails.firstName) ? 'form-input-error' : ''}`}
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={shippingDetails.firstName}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    required
                                />
                                {activeInvalidShippingField === 'firstName' && getShippingFieldError('firstName', shippingDetails.firstName) ? (
                                    <span className="form-error">{getShippingFieldError('firstName', shippingDetails.firstName)}</span>
                                ) : null}
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="middleName">Middle name</label>
                                <input
                                    className="form-input"
                                    id="middleName"
                                    name="middleName"
                                    type="text"
                                    value={shippingDetails.middleName}
                                    onChange={handleShippingChange}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="form-group checkout-form-full">
                                <label className="form-label" htmlFor="lastName">Last name <span className="required-indicator">*</span></label>
                                <input
                                    className={`form-input ${activeInvalidShippingField === 'lastName' && getShippingFieldError('lastName', shippingDetails.lastName) ? 'form-input-error' : ''}`}
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={shippingDetails.lastName}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    required
                                />
                                {activeInvalidShippingField === 'lastName' && getShippingFieldError('lastName', shippingDetails.lastName) ? (
                                    <span className="form-error">{getShippingFieldError('lastName', shippingDetails.lastName)}</span>
                                ) : null}
                            </div>
                            <div className="form-group checkout-form-full">
                                <label className="form-label" htmlFor="email">Email <span className="required-indicator">*</span></label>
                                <input
                                    className={`form-input ${activeInvalidShippingField === 'email' && getShippingFieldError('email', shippingDetails.email) ? 'form-input-error' : ''}`}
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={shippingDetails.email}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    placeholder="name@example.com"
                                    required
                                />
                                {activeInvalidShippingField === 'email' && getShippingFieldError('email', shippingDetails.email) ? (
                                    <span className="form-error">{getShippingFieldError('email', shippingDetails.email)}</span>
                                ) : null}
                            </div>
                            <div className="form-group checkout-form-full">
                                <label className="form-label" htmlFor="address">Address <span className="required-indicator">*</span></label>
                                <input
                                    className={`form-input ${activeInvalidShippingField === 'address' && getShippingFieldError('address', shippingDetails.address) ? 'form-input-error' : ''}`}
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={shippingDetails.address}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    placeholder="Street address or P.O. box"
                                    required
                                />
                                {activeInvalidShippingField === 'address' && getShippingFieldError('address', shippingDetails.address) ? (
                                    <span className="form-error">{getShippingFieldError('address', shippingDetails.address)}</span>
                                ) : null}
                                <input
                                    className="form-input"
                                    id="address2"
                                    name="address2"
                                    type="text"
                                    value={shippingDetails.address2}
                                    onChange={handleShippingChange}
                                    placeholder="Apt, suite, unit, building (optional)"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="city">City <span className="required-indicator">*</span></label>
                                <input
                                    className={`form-input ${activeInvalidShippingField === 'city' && getShippingFieldError('city', shippingDetails.city) ? 'form-input-error' : ''}`}
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={shippingDetails.city}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    required
                                />
                                {activeInvalidShippingField === 'city' && getShippingFieldError('city', shippingDetails.city) ? (
                                    <span className="form-error">{getShippingFieldError('city', shippingDetails.city)}</span>
                                ) : null}
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="state">State <span className="required-indicator">*</span></label>
                                <select
                                    className={`form-input ${activeInvalidShippingField === 'state' && getShippingFieldError('state', shippingDetails.state) ? 'form-input-error' : ''}`}
                                    id="state"
                                    name="state"
                                    value={shippingDetails.state}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    required
                                >
                                    <option value="">Select a state</option>
                                    {US_STATES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {activeInvalidShippingField === 'state' && getShippingFieldError('state', shippingDetails.state) ? (
                                    <span className="form-error">{getShippingFieldError('state', shippingDetails.state)}</span>
                                ) : null}
                            </div>
                            <div className="form-group checkout-form-full">
                                <label className="form-label" htmlFor="zipCode">Zip code <span className="required-indicator">*</span></label>
                                <input
                                    className={`form-input ${activeInvalidShippingField === 'zipCode' && getShippingFieldError('zipCode', shippingDetails.zipCode) ? 'form-input-error' : ''}`}
                                    id="zipCode"
                                    name="zipCode"
                                    type="text"
                                    inputMode="numeric"
                                    value={shippingDetails.zipCode}
                                    onChange={handleShippingChange}
                                    onBlur={handleShippingBlur}
                                    required
                                />
                                {activeInvalidShippingField === 'zipCode' && getShippingFieldError('zipCode', shippingDetails.zipCode) ? (
                                    <span className="form-error">{getShippingFieldError('zipCode', shippingDetails.zipCode)}</span>
                                ) : null}
                            </div>
                        </div>

                        {user ? (
                            <div className="form-group checkout-save-address">
                                <label className="checkout-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="checkout-checkbox"
                                        checked={saveAddress}
                                        onChange={(e) => setSaveAddress(e.target.checked)}
                                    />
                                    Save as my default address
                                </label>
                            </div>
                        ) : null}

                        <h2 className='checkout-section-title'>Payment details</h2>
                        <div className="form-group">
                            <label className="form-label" htmlFor="paymentMethod">Preferred payment option</label>
                            <select
                                className="form-input"
                                id="paymentMethod"
                                name="paymentMethod"
                                value={paymentDetails.paymentMethod}
                                onChange={handlePaymentChange}
                            >
                                <option value="card">Credit / Debit Card (simulated)</option>
                                <option value="cash">Cash on delivery</option>
                                <option value="bank">Bank transfer</option>
                            </select>
                        </div>

                        <div className="form-group checkout-form-full">
                            <label className="form-label" htmlFor="billingAddress">Billing address <span className="required-indicator">*</span></label>
                            <input
                                className="form-input"
                                id="billingAddress"
                                name="billingAddress"
                                type="text"
                                value={paymentDetails.billingAddress}
                                onChange={handlePaymentChange}
                                placeholder="Enter billing address"
                                required
                            />
                        </div>

                        {paymentDetails.paymentMethod === 'card' ? (
                            <div className="checkout-form-grid">
                                <div className="form-group checkout-form-full">
                                    <label className="form-label" htmlFor="cardName">Name on card <span className="required-indicator">*</span></label>
                                    <input
                                        className={`form-input ${activeInvalidPaymentField === 'cardName' && getPaymentFieldError('cardName', paymentDetails.cardName) ? 'form-input-error' : ''}`}
                                        id="cardName"
                                        name="cardName"
                                        type="text"
                                        value={paymentDetails.cardName}
                                        onChange={handlePaymentChange}
                                        onBlur={handlePaymentBlur}
                                        placeholder="Jane Doe"
                                        required
                                    />
                                    {activeInvalidPaymentField === 'cardName' && getPaymentFieldError('cardName', paymentDetails.cardName) ? (
                                        <span className="form-error">{getPaymentFieldError('cardName', paymentDetails.cardName)}</span>
                                    ) : null}
                                </div>
                                <div className="form-group checkout-form-full">
                                    <label className="form-label" htmlFor="cardNumber">Card number <span className="required-indicator">*</span></label>
                                    <input
                                        className={`form-input ${activeInvalidPaymentField === 'cardNumber' && getPaymentFieldError('cardNumber', paymentDetails.cardNumber) ? 'form-input-error' : ''}`}
                                        id="cardNumber"
                                        name="cardNumber"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="cc-number"
                                        value={formatCardNumber(paymentDetails.cardNumber)}
                                        onChange={handlePaymentChange}
                                        onBlur={handlePaymentBlur}
                                        placeholder="4111 1111 1111 1111"
                                        maxLength={19}
                                        required
                                    />
                                    {activeInvalidPaymentField === 'cardNumber' && getPaymentFieldError('cardNumber', paymentDetails.cardNumber) ? (
                                        <span className="form-error">{getPaymentFieldError('cardNumber', paymentDetails.cardNumber)}</span>
                                    ) : null}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="expiryDate">Expiry date <span className="required-indicator">*</span></label>
                                    <input
                                        className={`form-input ${activeInvalidPaymentField === 'expiryDate' && getPaymentFieldError('expiryDate', paymentDetails.expiryDate) ? 'form-input-error' : ''}`}
                                        id="expiryDate"
                                        name="expiryDate"
                                        type="text"
                                        value={paymentDetails.expiryDate}
                                        onChange={handlePaymentChange}
                                        onBlur={handlePaymentBlur}
                                        placeholder="MM/YY"
                                        required
                                    />
                                    {activeInvalidPaymentField === 'expiryDate' && getPaymentFieldError('expiryDate', paymentDetails.expiryDate) ? (
                                        <span className="form-error">{getPaymentFieldError('expiryDate', paymentDetails.expiryDate)}</span>
                                    ) : null}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cvv">CVV <span className="required-indicator">*</span></label>
                                    <input
                                        className={`form-input ${activeInvalidPaymentField === 'cvv' && getPaymentFieldError('cvv', paymentDetails.cvv) ? 'form-input-error' : ''}`}
                                        id="cvv"
                                        name="cvv"
                                        type="text"
                                        inputMode="numeric"
                                        value={paymentDetails.cvv}
                                        onChange={handlePaymentChange}
                                        onBlur={handlePaymentBlur}
                                        placeholder="123"
                                        required
                                    />
                                    {activeInvalidPaymentField === 'cvv' && getPaymentFieldError('cvv', paymentDetails.cvv) ? (
                                        <span className="form-error">{getPaymentFieldError('cvv', paymentDetails.cvv)}</span>
                                    ) : null}
                                </div>
                            </div>
                        ) : (
                            <p className="checkout-payment-hint">
                                You selected a non-card method. No credit card details are required for this simulation.
                            </p>
                        )}

                        <div className='checkout-total'>
                            <p className='checkout-total-label'>Subtotal:</p>
                            <p className='checkout-total-value'>${total.toFixed(2)}</p>
                        </div>
                        <div className='checkout-total'>
                            <p className='checkout-total-label'>Total:</p>
                            <p className='checkout-total-value checkout-total-final'>
                                ${total.toFixed(2)}
                            </p>
                        </div>
                        <button
                            className="btn btn-primary btn-large btn-block"
                            type="submit"
                            disabled={isCartEmpty}
                        >
                            Place Order
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}