import {useEffect, useState} from "react";
import {getProducts} from "../Services/productApi";

function useProducts(){
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError("");

            try{
                const response = await getProducts();

                setProducts(response.data?.content || []);
            }catch(error){
                console.error(
                    "Failed to fetch products:",
                    error.response?.data || error
                );
                setError(
                    error.response?.data?.message ||
                    "Failed to load products"
                );
            }finally{
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return {
        products,
        isLoading,
        error,
    };
}

export default useProducts;
