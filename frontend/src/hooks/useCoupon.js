import {useState} from "react"
import {validateCoupon} from "../Services/couponApi";

function useCoupon(totalPrice) {
    const [couponCode, setCouponCode] = useState("");
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        const trimmedCode = couponCode.trim();

        if(!trimmedCode){
            setCoupon(null);
            setCouponError("Please enter promo code.");
            return ;
        }
        setCouponError("");
        setCoupon(null);
        setIsApplyingCoupon(true);

        try{
            const couponData = await validateCoupon(trimmedCode);

            if(!couponData) {
                throw new Error(
                    "Coupon data was not returned by server."
                );
            }

            if(couponData.active === false){
                throw new Error(
                    "Coupon is not active."
                );
            }
            const minimumOrderAmount= Number(
                couponData.minimumOrderAmount || 0
            );

            if(totalPrice < minimumOrderAmount){
                setCouponError(
                    `Your order must be at least $${minimumOrderAmount.toFixed(2)} to use this coupon`
                );
                return;
            }

            setCoupon(couponData);
            setCouponError("");
        }catch(error){
            console.error(
                "Coupon validation failed: ",
                error.response?.data?.message ||
                error.message ||
                "Invalid, expired, or unavailable promo code."
            );
        } finally{
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCoupon(null);
        setCoupon("");
        setCouponError("");
    };
    return {
        couponCode,
        setCouponCode,
        coupon,
        couponError,
        setCouponError,
        isApplyingCoupon,
        handleApplyCoupon,
        handleRemoveCoupon
    };
}
export default useCoupon;
