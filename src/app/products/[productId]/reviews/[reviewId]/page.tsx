import {notFound} from "next/navigation"; 

export default function reviewDetails( {params} : {params : {productId: string, reviewId: string }}){

    if(parseInt(params.reviewId) > 1000){
        notFound(); 
    }
    return <h3>Review of product {params.productId} ReviewId: {params.reviewId}</h3>
}