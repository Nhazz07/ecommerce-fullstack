import React from 'react'
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getProductById} from "../Services/productApi"

function ProductDetail() {
  const {id} = useParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try{
        setIsLoading(true);
        setError("");

        const response = await getProductById(id);

        setProduct(response.data);
      }catch(error){
        console.error(
          "Failed to fetch product: ",
          error.response?.data || error
        );
        setError(
          error.response?.data?.message ||
          "Failed to load product."
        );
      }finally{
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  if(isLoading){

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 dark:bg-[#0B1020]">
                <div className="mx-auto max-w-7xl py-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Loading product...
                    </p>
                </div>
            </main>
    );
  }

  if(error){
    return(
       <main className="min-h-screen bg-white px-4 pb-16 pt-24 dark:bg-[#0B1020]">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                        {error}
                    </div>
                </div>
            </main>
    );
  }
  if(!product){
    return null;
  }
  return (
     <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold">
                    {product.name}
                </h1>
            </div>
        </main>
  )
}

export default ProductDetail;
