import { supabase } from "./supabase";
import { logActivity } from "./admin-activity";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string | null;
  notes: string | null;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
}

export interface AdminOrderItem {
  id: number;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

type OrderRow = {
  id: string;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string | null;
  notes: string | null;
  payment_method: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  created_at: string;
};

type ItemRow = {
  id: number;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  qty: number;
  line_total: number;
};

const ORDER_COLS =
  "id, status, first_name, last_name, email, phone, address, city, zip, notes, payment_method, subtotal, shipping, total, currency, created_at";

function rowToOrder(r: OrderRow): AdminOrder {
  return {
    id: r.id,
    status: r.status,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    zip: r.zip,
    notes: r.notes,
    paymentMethod: r.payment_method,
    subtotal: r.subtotal,
    shipping: r.shipping,
    total: r.total,
    currency: r.currency,
    createdAt: r.created_at,
  };
}

function rowToItem(r: ItemRow): AdminOrderItem {
  return {
    id: r.id,
    orderId: r.order_id,
    productId: r.product_id,
    productName: r.product_name,
    unitPrice: r.unit_price,
    qty: r.qty,
    lineTotal: r.line_total,
  };
}

export async function listOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLS)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listOrders:", error);
    return [];
  }
  return (data as OrderRow[]).map(rowToOrder);
}

export async function listOrderItems(orderId: string): Promise<AdminOrderItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, product_name, unit_price, qty, line_total")
    .eq("order_id", orderId)
    .order("id", { ascending: true });
  if (error) {
    console.error("listOrderItems:", error);
    return [];
  }
  return (data as ItemRow[]).map(rowToItem);
}

export async function listAllOrderItems(
  orderIds?: string[]
): Promise<AdminOrderItem[]> {
  let q = supabase
    .from("order_items")
    .select("id, order_id, product_id, product_name, unit_price, qty, line_total");
  if (orderIds && orderIds.length > 0) q = q.in("order_id", orderIds);
  const { data, error } = await q;
  if (error) {
    console.error("listAllOrderItems:", error);
    return [];
  }
  return (data as ItemRow[]).map(rowToItem);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (!error) {
    logActivity({
      action: "order.status_changed",
      entityType: "order",
      entityId: id,
      details: { status },
    });
  }
  return { error: error?.message ?? null };
}
