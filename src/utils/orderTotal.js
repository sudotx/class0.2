// Pure order pricing: snapshots name/price from live products (never trusts
// client-supplied prices) and validates stock/existence before checkout.
export function computeOrderTotal(cartItems, products) {
    const productsById = new Map(products.map((p) => [p._id.toString(), p]));
    const items = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
        const product = productsById.get(cartItem.productId.toString());
        if (!product || !product.isActive) {
            throw new Error(`product ${cartItem.productId} is no longer available`);
        }
        if (cartItem.quantity > product.stock) {
            throw new Error(`insufficient stock for ${product.name}`);
        }

        const lineTotal = product.price * cartItem.quantity;
        totalAmount += lineTotal;
        items.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
        });
    }

    return { items, totalAmount };
}
