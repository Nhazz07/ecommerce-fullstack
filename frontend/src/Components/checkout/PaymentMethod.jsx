import React from 'react'

function PaymentMethod({
    paymentMethod,
    setPaymentMethod,
}) {
    const paymentMethods = [
        {
            value: "CASH_ON_DELIVERY",
            label: "Cash on Delivery",
        },
        {
            value: "ABA",
            label: "ABA Pay",
        },
        {
            value: "ACLEDA",
            label: "ACLEDA",
        },
        {
            value: "CREDIT_CARD",
            label: "Visa / Mastercard Credit Card",
        },
        {
            value: "DEBIT_CARD",
            label: "Visa / Mastercard Debit Card",
        },
        {
            value: "PAYPAL",
            label: "PayPal",
        },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold">
                Payment Method
            </h2>

            <div className="mt-4 space-y-3">
                {paymentMethods.map((method) => (
                    <label
                        key={method.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                            paymentMethod === method.value
                                ? "border-pink-400 bg-pink-50 dark:bg-pink-500/10"
                                : "border-gray-300 dark:border-white/10"
                        }`}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={
                                paymentMethod === method.value
                            }
                            onChange={(event) =>
                                setPaymentMethod(event.target.value)
                            }
                        />

                        <span className="font-medium">
                            {method.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default PaymentMethod;
