import { supabase } from "./supabase";
import type { CartItem, Product } from "./types";

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip?: string;
  notes?: string;
}

export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank";

export interface CreateOrderInput {
  customer: OrderCustomer;
  payment: PaymentMethod;
  items: CartItem[];
  products: Product[];
  shipping: number;
}

export interface CreateOrderResult {
  id: string;
  subtotal: number;
  shipping: number;
  total: number;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const { customer, payment, items, products, shipping } = input;

  const productById = new Map(products.map((p) => [p.id, p]));
  const lineItems = items
    .map((item) => {
      const p = productById.get(item.id);
      if (!p) return null;
      const lineTotal = p.price * item.qty;
      return {
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        qty: item.qty,
        line_total: lineTotal,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    throw new Error("Cart is empty — nothing to order.");
  }

  const subtotal = lineItems.reduce((s, li) => s + li.line_total, 0);
  const total = subtotal + shipping;

  const { data: orderRows, error: orderErr } = await supabase
    .from("orders")
    .insert({
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      zip: customer.zip || null,
      notes: customer.notes || null,
      payment_method: payment,
      subtotal,
      shipping,
      total,
    })
    .select("id")
    .single();

  if (orderErr || !orderRows) {
    throw new Error(
      `Could not place order: ${orderErr?.message ?? "unknown error"}`
    );
  }

  const orderId = orderRows.id as string;

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: orderId })));

  if (itemsErr) {
    throw new Error(
      `Order created but items failed (${orderId}): ${itemsErr.message}`
    );
  }

  return { id: orderId, subtotal, shipping, total };
}
