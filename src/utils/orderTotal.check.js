import assert from "node:assert";
import { computeOrderTotal } from "./orderTotal.js";

const products = [
    { _id: "p1", name: "Widget", price: 1000, stock: 5, isActive: true },
    { _id: "p2", name: "Gadget", price: 2500, stock: 1, isActive: true },
    { _id: "p3", name: "Discontinued", price: 500, stock: 5, isActive: false },
];

// correct total across multiple line items
{
    const { items, totalAmount } = computeOrderTotal(
        [{ productId: "p1", quantity: 2 }, { productId: "p2", quantity: 1 }],
        products,
    );
    assert.strictEqual(totalAmount, 4500);
    assert.strictEqual(items.length, 2);
}

// quantity exceeds stock -> rejected
{
    assert.throws(() => computeOrderTotal([{ productId: "p2", quantity: 2 }], products));
}

// inactive/removed product -> rejected, not silently skipped
{
    assert.throws(() => computeOrderTotal([{ productId: "p3", quantity: 1 }], products));
}

// unknown product id -> rejected
{
    assert.throws(() => computeOrderTotal([{ productId: "missing", quantity: 1 }], products));
}

console.log("orderTotal.check.js: all assertions passed");
