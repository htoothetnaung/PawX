export default function productDetails( {params} : {params: {productId: string}}){


    return <h1>Product Details about {params.productId} </h1>
}