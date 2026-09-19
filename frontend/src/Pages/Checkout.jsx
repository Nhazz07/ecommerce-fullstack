import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import CouponInput from "../Components/checkout/CouponInput"
import OrderSummary from "../Components/checkout/OrderSummary"
import PaymentMethod from "../Components/checkout/PaymentMethod"
import ShippingForm from "../Components/checkout/ShipingForm"
import useCheckout from "../hooks/useCheckout";
import useCoupon from "../hooks/useCoupon";

import {
    calculateSubtotal,
    calculateDiscount,
    calculateFinalTotal,
} from "../checkoutService/checkoutCalculator"

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();

    // Calculate subtotal
    const totalPrice = calculateSubtotal(cartItems);

    // Coupon hook
    const {
        couponCode,
        setCouponCode,
        coupon,
        couponError,
        setCouponError,
        isApplyingCoupon,
        handleApplyCoupon,
        handleRemoveCoupon,
    } = useCoupon(totalPrice);

    // Checkout hook
    const {
        formData,
        paymentMethod,
        isSubmitting,
        error,
        setPaymentMethod,
        handleChange,
        handleSubmit,
    } = useCheckout({
        coupon,
        clearCart,
        navigate,
    });

    // Shipping fee
    const shippingFee = 3;

    // Calculate discount
    const discountAmount = calculateDiscount(
        totalPrice,
        coupon
    );

    // Calculate final total
    const finalTotal = calculateFinalTotal(
        totalPrice,
        discountAmount,
        shippingFee
    );

    // Empty cart
    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-white px-4 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
                <div className="mx-auto max-w-3xl py-24 text-center">
                    <h1 className="text-3xl font-bold">
                        Your Cart Is Empty
                    </h1>

                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Add products before proceeding to checkout.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-pink-400 px-6 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300"
                    >
                        Continue Shopping
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold">
                    Checkout
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-8 lg:grid-cols-3"
                >
                    {/* Left side */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                        {/* Shipping Form */}
                        <ShippingForm
                            formData={formData}
                            handleChange={handleChange}
                            error={error}
                        />

                        {/* Payment Method */}
                        <div className="mt-8">
                            <PaymentMethod
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                            />
                        </div>

                        {/* Promo Code */}
                        <CouponInput
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            couponError={couponError}
                            setCouponError={setCouponError}
                            coupon={coupon}
                            isApplyingCoupon={isApplyingCoupon}
                            handleApplyCoupon={handleApplyCoupon}
                            handleRemoveCoupon={handleRemoveCoupon}
                        />
                    </section>

                    {/* Right side */}
                    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                        <OrderSummary
                            cartItems={cartItems}
                            totalPrice={totalPrice}
                            coupon={coupon}
                            discountAmount={discountAmount}
                            shippingFee={shippingFee}
                            finalTotal={finalTotal}
                            isSubmitting={isSubmitting}
                        />
                    </aside>
                </form>
            </div>
        </main>
    );
}

export default Checkout;
