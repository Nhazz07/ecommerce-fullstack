import React from 'react'

function ShipingForm({
    formData,
    handleChange,
    error,
}) {
    return (
        <div>
            <h2 className="text-xl font-bold">
                Shipping Information
            </h2>

            {error && (
                <div className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                    <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium"
                    >
                        Full Name
                    </label>

                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium"
                    >
                        Phone Number
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                    />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="address"
                        className="mb-2 block text-sm font-medium"
                    >
                        Address
                    </label>

                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="Enter your shipping address"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                    />
                </div>

                {/* City */}
                <div>
                    <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-medium"
                    >
                        City
                    </label>

                    <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Enter your city"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                    />
                </div>

                {/* Country */}
                <div>
                    <label
                        htmlFor="country"
                        className="mb-2 block text-sm font-medium"
                    >
                        Country
                    </label>

                    <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Enter your country"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                    />
                </div>
            </div>
        </div>
    );
}

export default ShipingForm;
