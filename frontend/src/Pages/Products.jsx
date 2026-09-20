import useProducts from "../hooks/useProducts";

function Products() {
  const {
    products,
    isLoading,
    error,
  } = useProducts();

  if(isLoading) {
    return <div>Loading products.......</div>
  }

  if(error){
    return <div>{error}</div>
  }
  return (
    <div>
      <h1>Products</h1>
      <pre>
        {JSON.stringify(products, null, 2)}
      </pre>
    </div>
  )
}

export default Products;
