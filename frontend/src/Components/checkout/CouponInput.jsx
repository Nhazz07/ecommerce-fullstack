import React from 'react'

function CouponInput({
    couponCode,
    setCouponCode,
    couponError,
    coupon,
    isApplyingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
}) {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold">
                Promo Code / Coupon
            </h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => {
                        setCouponCode(event.target.value);
                    }}
                    placeholder="Enter promo code"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 uppercase outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                />

                <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                        !couponCode.trim() ||
                        isApplyingCoupon
                    }
                    className="rounded-lg bg-pink-400 px-5 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isApplyingCoupon
                        ? "Checking..."
                        : "Apply"}
                </button>
            </div>

            {couponError && (
                <p className="mt-2 text-sm text-red-500">
                    {couponError}
                </p>
            )}

            {coupon && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                    <span>
                        Coupon{" "}
                        <strong>{coupon.code}</strong>{" "}
                        applied
                    </span>

                    <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="font-semibold hover:underline"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
}

export default CouponInput;
