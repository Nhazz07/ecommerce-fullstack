import { useNavigate } from "react-router-dom";
import bleach from "../assets/figurebleach.jpg";
import ProductCard from "../Components/ProductCard";
import {getAllProduct} from "../Services/productApi";
import { useEffect, useState } from "react";
const categories = [
    "All",
    "Figures",
    "Apparel",
    "Posters",
    "Keychains",
    "Drinkware",
    "Manga",
    "Accessories",
];

function Home() {
const navigate = useNavigate();

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
    useEffect(() => {
        const fetchProducts = async () => {
            try{
                const response = await getAllProduct();

                setProducts(response.data.content);
            }catch(error){
                console.log("Failed to fetch a products.", error);
                setError("Failed to load a product");
            }finally{
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    if(loading) {
        return <p>Loading products....</p>;
    }
    if(error){
        return <p>{}</p>
    }

    return (
        <main className="bg-white text-[#0B1020] dark:bg-[#0B1020] dark:text-white">

            {/* Hero */}
            <section className="min-h-[620px] pt-16 flex items-center">
                <div className="max-w-7xl mx-auto w-full px-6 grid md:grid-cols-2 gap-10 items-center">

                    <div>
                        <p className="text-sm font-semibold tracking-[3px] text-pink-400 mb-4">
                            OFFICIAL ANIME MERCHANDISE
                        </p>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Your Favorite Anime,
                            <span className="text-pink-400"> Closer Than Ever</span>
                        </h1>

                        <p className="mt-6 text-gray-500 dark:text-gray-400 max-w-lg">
                            Discover    authentic figures, apparel, accessories
                            and more from the anime you love.
                        </p>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => navigate("/products")}
                                className="px-6 py-3 rounded-lg bg-pink-400 text-[#0B1020] font-semibold hover:bg-pink-300 transition"
                            >
                                Shop Now →
                            </button>

                            <button
                                onClick={() => navigate("/products")}
                                className="px-6 py-3 rounded-lg border border-[#0B1020]/20 dark:border-white/20 font-semibold"
                            >
                                Explore Products
                            </button>
                        </div>
                    </div>

                    <div className="h-[420px] rounded-2xl overflow-hidden">
                        <img
                            src={bleach}
                            className="w-full h-full object-cover"
                            alt="Anime merchandise"
                        />
                    </div>

                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Shop by Category</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Find something you'll love.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/products")}
                        className="text-pink-400 text-sm font-semibold"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="py-5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-pink-400 transition"
                        >
                            <span className="text-sm font-medium">{category}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Products */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Featured Products</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Handpicked items for true fans.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/products")}
                        className="text-pink-400 text-sm font-semibold"
                    >
                        View All →
                    </button>
                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section className="border-t border-gray-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-semibold">Fast Shipping</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Quick delivery across Cambodia.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Secure Payment</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Shop with confidence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Dedicated Support</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            We're here when you need us.
                        </p>
                    </div>
                </div>
            </section>

        </main>
    );
}

export default Home;
