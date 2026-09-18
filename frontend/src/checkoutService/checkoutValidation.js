export function validateShippingForm(formData) {
    const errors = {};

    if (!formData.fullName.trim()) {
        errors.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
        errors.phone = "Phone number is required.";
    }

    if (!formData.address.trim()) {
        errors.address = "Address is required.";
    }

    if (!formData.city.trim()) {
        errors.city = "City is required.";
    }

    if (!formData.country.trim()) {
        errors.country = "Country is required.";
    }

    return errors;
}
