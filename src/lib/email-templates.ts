const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mayursilks.com";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function base(content: string, preheader = ""): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head>
<body style="margin:0;padding:0;background-color:#faf7f2;font-family:Georgia,'Times New Roman',serif;">
${preheader ? `<span style="display:none;font-size:1px;max-height:0;line-height:1px;color:#faf7f2;overflow:hidden;">${preheader}</span>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf7f2"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="background:linear-gradient(135deg,#550022 0%,#3c0018 50%,#2f0013 100%);padding:28px 36px;border-radius:16px 16px 0 0;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:rgba(252,209,70,0.12);border:1px solid rgba(252,209,70,0.3);border-radius:8px;padding:8px 18px;display:inline-block;">
        <span style="font-size:20px;font-weight:bold;color:#fcd146;letter-spacing:3px;font-family:Georgia,serif;">MAYUR SILKS</span>
      </td></tr>
      <tr><td style="padding-top:8px;"><span style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:4px;text-transform:uppercase;font-family:Georgia,serif;">Premium Handloom Sarees</span></td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:40px 36px;">${content}</td></tr>
  <tr><td style="background:#f5efe3;padding:24px 36px;border-radius:0 0 16px 16px;border-top:1px solid #ede0cb;text-align:center;">
    <p style="color:#8d546b;font-size:12px;margin:0 0 6px;font-family:Georgia,serif;">© ${year} Mayur Silks. All rights reserved.</p>
    <p style="color:#b18a99;font-size:11px;margin:0 0 10px;font-family:Georgia,serif;">You received this because of your activity on Mayur Silks.</p>
    <p style="margin:0;">
      <a href="${BASE_URL}" style="color:#550022;font-size:11px;text-decoration:none;font-family:Georgia,serif;">Visit Store</a>
      <span style="color:#b18a99;margin:0 8px;">•</span>
      <a href="${BASE_URL}/account/orders" style="color:#550022;font-size:11px;text-decoration:none;font-family:Georgia,serif;">My Orders</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function divider(): string {
  return `<div style="height:1px;background:linear-gradient(90deg,transparent,#ede0cb,transparent);margin:24px 0;"></div>`;
}

function ctaButton(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 24px;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#550022,#3c0018);color:#ffffff;font-family:Georgia,serif;font-size:14px;font-weight:bold;letter-spacing:1px;text-decoration:none;padding:14px 36px;border-radius:50px;">${text}</a>
  </td></tr></table>`;
}

// ─────────────────────────────────────────────────────────────
// SHARED INTERFACES
// ─────────────────────────────────────────────────────────────

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
}

export interface OrderEmailAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
}

// ─────────────────────────────────────────────────────────────
// WELCOME EMAIL
// ─────────────────────────────────────────────────────────────

export function welcomeTemplate(name: string): string {
  const content = `
<h1 style="color:#550022;font-size:26px;font-weight:normal;margin:0 0 4px;font-family:Georgia,serif;">Welcome to Mayur Silks</h1>
<p style="color:#8d546b;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;font-family:Georgia,serif;">Your Handloom Journey Begins</p>
${divider()}
<p style="color:#4a4a4a;font-size:15px;line-height:1.8;margin:0 0 16px;font-family:Georgia,serif;">Dear <strong style="color:#550022;">${name}</strong>,</p>
<p style="color:#4a4a4a;font-size:15px;line-height:1.8;margin:0 0 16px;font-family:Georgia,serif;">
  Welcome! We are delighted to have you as part of the Mayur Silks family. Explore our curated collection of exquisite handloom silk sarees, crafted by skilled artisans and delivered to your doorstep.
</p>
${ctaButton("Explore Collection →", `${BASE_URL}/products`)}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:12px;margin-top:8px;">
  <tr><td style="padding:20px 24px;">
    <p style="color:#550022;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;font-family:Georgia,serif;">Why Mayur Silks?</p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${["100% Authentic Handloom Sarees", "Free Shipping on All Orders", "Secure Razorpay Payments", "Easy Returns & Hassle-Free Refunds"].map(t => `
      <tr><td style="padding:5px 0;">
        <span style="color:#fcd146;font-size:14px;margin-right:10px;">✦</span>
        <span style="color:#4a4a4a;font-size:13px;font-family:Georgia,serif;">${t}</span>
      </td></tr>`).join("")}
    </table>
  </td></tr>
</table>`;
  return base(content, `Welcome to Mayur Silks, ${name}! Your handloom journey begins.`);
}

// ─────────────────────────────────────────────────────────────
// ORDER CONFIRMATION
// ─────────────────────────────────────────────────────────────

export interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string | null;
  address: OrderEmailAddress;
  paymentMethod: string;
}

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const {
    customerName, orderNumber, orderDate, items,
    subtotal, discount, total, couponCode, address, paymentMethod,
  } = data;

  const itemRows = items.map((item) => `
<tr>
  <td style="padding:12px 0;border-bottom:1px solid #f5efe3;vertical-align:top;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${item.image ? `<td width="60" style="vertical-align:top;padding-right:12px;">
        <img src="${item.image}" width="56" height="68" alt="${item.name}" style="border-radius:6px;display:block;object-fit:cover;" />
      </td>` : ""}
      <td style="vertical-align:top;">
        <p style="color:#2d2d2d;font-size:13px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">${item.name}</p>
        <p style="color:#8d8d8d;font-size:12px;margin:0;font-family:Georgia,serif;">Qty: ${item.quantity}</p>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <p style="color:#550022;font-size:13px;font-weight:bold;margin:0;font-family:Georgia,serif;">${fmt(item.price * item.quantity)}</p>
      </td>
    </tr></table>
  </td>
</tr>`).join("");

  const addrLine = [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean).join(", ");

  const content = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#550022,#3c0018);border-radius:12px;margin-bottom:24px;">
  <tr><td style="padding:20px 24px;">
    <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;font-family:Georgia,serif;">Order Confirmed</p>
    <p style="color:#fcd146;font-size:22px;font-weight:bold;margin:0 0 2px;font-family:Georgia,serif;">#${orderNumber}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:0;font-family:Georgia,serif;">${orderDate}</p>
  </td></tr>
</table>

<p style="color:#4a4a4a;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Georgia,serif;">
  Dear <strong style="color:#550022;">${customerName}</strong>, your order has been placed successfully. We'll start preparing it right away!
</p>

<h3 style="color:#550022;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Georgia,serif;">Order Items</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0">${itemRows}</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#faf7f2;border-radius:10px;">
  <tr><td style="padding:16px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:4px 0;"><span style="color:#6b6b6b;font-size:13px;font-family:Georgia,serif;">Subtotal</span></td><td style="text-align:right;"><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${fmt(subtotal)}</span></td></tr>
      ${discount > 0 ? `<tr><td style="padding:4px 0;"><span style="color:#16a34a;font-size:13px;font-family:Georgia,serif;">Discount${couponCode ? ` (${couponCode})` : ""}</span></td><td style="text-align:right;"><span style="color:#16a34a;font-size:13px;font-family:Georgia,serif;">−${fmt(discount)}</span></td></tr>` : ""}
      <tr><td style="padding:4px 0;"><span style="color:#6b6b6b;font-size:13px;font-family:Georgia,serif;">Shipping</span></td><td style="text-align:right;"><span style="color:#16a34a;font-size:13px;font-weight:bold;font-family:Georgia,serif;">FREE</span></td></tr>
      <tr><td style="padding-top:12px;border-top:1px solid #ede0cb;"><span style="color:#550022;font-size:15px;font-weight:bold;font-family:Georgia,serif;">Total</span></td><td style="text-align:right;padding-top:12px;border-top:1px solid #ede0cb;"><span style="color:#550022;font-size:15px;font-weight:bold;font-family:Georgia,serif;">${fmt(total)}</span></td></tr>
    </table>
  </td></tr>
</table>

${divider()}

<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td style="vertical-align:top;width:50%;padding-right:12px;">
    <h3 style="color:#550022;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;font-family:Georgia,serif;">Delivery Address</h3>
    <p style="color:#2d2d2d;font-size:13px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">${address.name}</p>
    <p style="color:#6b6b6b;font-size:12px;line-height:1.7;margin:0;font-family:Georgia,serif;">${addrLine}</p>
    <p style="color:#6b6b6b;font-size:12px;margin:4px 0 0;font-family:Georgia,serif;">📞 ${address.phone}</p>
  </td>
  <td style="vertical-align:top;width:50%;padding-left:12px;border-left:1px solid #ede0cb;">
    <h3 style="color:#550022;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;font-family:Georgia,serif;">Payment</h3>
    <p style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;margin:0;">${paymentMethod === "razorpay" ? "Online Payment (Razorpay)" : paymentMethod}</p>
    <p style="color:#16a34a;font-size:12px;font-weight:bold;margin:4px 0 0;font-family:Georgia,serif;">✓ Payment Successful</p>
  </td>
</tr></table>

${ctaButton("Track Your Order →", `${BASE_URL}/account/orders`)}`;

  return base(content, `Order #${orderNumber} confirmed — Thank you for shopping with Mayur Silks!`);
}

// ─────────────────────────────────────────────────────────────
// PAYMENT SUCCESS
// ─────────────────────────────────────────────────────────────

export interface PaymentSuccessData {
  customerName: string;
  orderNumber: string;
  paymentId: string;
  amount: number;
  paymentDate: string;
}

export function paymentSuccessTemplate(data: PaymentSuccessData): string {
  const { customerName, orderNumber, paymentId, amount, paymentDate } = data;
  const content = `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;line-height:1;margin-bottom:12px;">✅</div>
  <h1 style="color:#16a34a;font-size:24px;font-weight:normal;margin:0 0 6px;font-family:Georgia,serif;">Payment Successful!</h1>
  <p style="color:#6b6b6b;font-size:14px;margin:0;font-family:Georgia,serif;">Your payment has been confirmed for Order #${orderNumber}</p>
</div>
${divider()}
<p style="color:#4a4a4a;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Georgia,serif;">
  Dear <strong style="color:#550022;">${customerName}</strong>, we've received your payment. Please save this confirmation for your records.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
          <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Payment ID</span>
          <br/><span style="color:#2d2d2d;font-size:13px;font-weight:bold;font-family:Georgia,serif;font-family:monospace;">${paymentId}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
          <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Order Number</span>
          <br/><span style="color:#550022;font-size:15px;font-weight:bold;font-family:Georgia,serif;">#${orderNumber}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
          <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Payment Date</span>
          <br/><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${paymentDate}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Amount Paid</span>
          <br/><span style="color:#16a34a;font-size:20px;font-weight:bold;font-family:Georgia,serif;">${fmt(amount)}</span>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
${ctaButton("View Your Order →", `${BASE_URL}/account/orders`)}`;

  return base(content, `Payment of ${fmt(amount)} confirmed for Order #${orderNumber}`);
}

// ─────────────────────────────────────────────────────────────
// ORDER STATUS UPDATE
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { headline: string; message: string; color: string; icon: string }> = {
  CONFIRMED: {
    headline: "Your Order Has Been Confirmed!",
    message: "Great news! Our team has confirmed your order and is getting your sarees ready.",
    color: "#2563eb",
    icon: "✅",
  },
  PACKED: {
    headline: "Your Order Is Packed!",
    message: "Your sarees have been carefully packed and are ready for dispatch.",
    color: "#7c3aed",
    icon: "📦",
  },
  SHIPPED: {
    headline: "Your Order Is on Its Way!",
    message: "Your order has been handed to our courier partner and is on its way to you.",
    color: "#0891b2",
    icon: "🚚",
  },
  OUT_FOR_DELIVERY: {
    headline: "Out for Delivery Today!",
    message: "Your order is out for delivery and will arrive at your doorstep today.",
    color: "#d97706",
    icon: "🏠",
  },
  DELIVERED: {
    headline: "Order Delivered Successfully!",
    message: "Your order has been delivered. We hope you love your new sarees! Please share your experience.",
    color: "#16a34a",
    icon: "🎉",
  },
  CANCELLED: {
    headline: "Your Order Has Been Cancelled",
    message: "Your order has been cancelled. If you made an online payment, the refund will be processed within 5–7 business days.",
    color: "#dc2626",
    icon: "❌",
  },
  RETURNED: {
    headline: "Return Request Processed",
    message: "Your return request has been accepted. The refund will be credited to your original payment method within 5–7 business days.",
    color: "#7c3aed",
    icon: "🔄",
  },
};

export interface OrderStatusData {
  customerName: string;
  orderNumber: string;
  status: string;
  orderId: string;
  trackingNumber?: string;
  courierPartner?: string;
  cancellationReason?: string;
}

export function orderStatusTemplate(data: OrderStatusData): string {
  const { customerName, orderNumber, status, orderId, trackingNumber, courierPartner, cancellationReason } = data;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CONFIRMED;

  const trackingSection = status === "SHIPPED" && trackingNumber
    ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:10px;margin-top:16px;margin-bottom:8px;">
  <tr><td style="padding:16px 20px;">
    <p style="color:#0891b2;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;font-family:Georgia,serif;">Shipment Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:4px 0;width:50%;vertical-align:top;">
          <p style="color:#6b6b6b;font-size:11px;margin:0 0 2px;font-family:Georgia,serif;">Tracking Number</p>
          <p style="color:#0891b2;font-size:14px;font-weight:bold;margin:0;font-family:monospace;">${trackingNumber}</p>
        </td>
        ${courierPartner ? `<td style="padding:4px 0;width:50%;vertical-align:top;padding-left:16px;border-left:1px solid #a5f3fc;">
          <p style="color:#6b6b6b;font-size:11px;margin:0 0 2px;font-family:Georgia,serif;">Courier Partner</p>
          <p style="color:#2d2d2d;font-size:14px;font-weight:bold;margin:0;font-family:Georgia,serif;">${courierPartner}</p>
        </td>` : ""}
      </tr>
    </table>
  </td></tr>
</table>` : "";

  const cancellationSection = status === "CANCELLED" && cancellationReason
    ? `
<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:12px 16px;border-radius:0 8px 8px 0;margin-top:16px;margin-bottom:8px;">
  <p style="color:#dc2626;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;font-family:Georgia,serif;">Cancellation Reason</p>
  <p style="color:#4a4a4a;font-size:13px;margin:0;line-height:1.6;font-family:Georgia,serif;">${cancellationReason}</p>
</div>` : "";

  const content = `
<div style="text-align:center;margin-bottom:24px;">
  <div style="font-size:48px;line-height:1;margin-bottom:12px;">${cfg.icon}</div>
  <h1 style="color:#550022;font-size:22px;font-weight:normal;margin:0 0 8px;font-family:Georgia,serif;">${cfg.headline}</h1>
  <p style="color:#6b6b6b;font-size:14px;line-height:1.7;margin:0;font-family:Georgia,serif;max-width:400px;display:inline-block;">${cfg.message}</p>
</div>
${divider()}
<p style="color:#4a4a4a;font-size:15px;line-height:1.8;margin:0 0 16px;font-family:Georgia,serif;">Dear <strong style="color:#550022;">${customerName}</strong>,</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:12px;margin-bottom:8px;">
  <tr><td style="padding:16px 24px;">
    <p style="color:#8d8d8d;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;font-family:Georgia,serif;">Order Reference</p>
    <p style="color:#550022;font-size:20px;font-weight:bold;margin:0;font-family:Georgia,serif;">#${orderNumber}</p>
    <p style="margin:8px 0 0;display:inline-block;background:${cfg.color};color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:50px;font-family:Georgia,serif;">${status.replace(/_/g, " ")}</p>
  </td></tr>
</table>
${trackingSection}
${cancellationSection}
${ctaButton("View Order Details →", `${BASE_URL}/account/orders/${orderId}`)}`;

  return base(content, `Order #${orderNumber} — ${cfg.headline}`);
}

// ─────────────────────────────────────────────────────────────
// REFUND PROCESSED
// ─────────────────────────────────────────────────────────────

export interface RefundProcessedData {
  customerName: string;
  orderNumber: string;
  refundAmount: number;
  refundId: string;
}

export function refundProcessedTemplate(data: RefundProcessedData): string {
  const { customerName, orderNumber, refundAmount, refundId } = data;
  const content = `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;line-height:1;margin-bottom:12px;">💸</div>
  <h1 style="color:#550022;font-size:24px;font-weight:normal;margin:0 0 6px;font-family:Georgia,serif;">Refund Processed</h1>
  <p style="color:#6b6b6b;font-size:14px;margin:0;font-family:Georgia,serif;">Your refund is on its way</p>
</div>
${divider()}
<p style="color:#4a4a4a;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Georgia,serif;">
  Dear <strong style="color:#550022;">${customerName}</strong>, we have processed the refund for your returned order. The amount will be credited to your original payment method.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:12px;margin-bottom:24px;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #ede0cb;">
        <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Order Number</span><br/>
        <span style="color:#550022;font-size:15px;font-weight:bold;font-family:Georgia,serif;">#${orderNumber}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #ede0cb;">
        <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Refund Reference</span><br/>
        <span style="color:#2d2d2d;font-size:13px;font-weight:bold;font-family:monospace;">${refundId}</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Refund Amount</span><br/>
        <span style="color:#16a34a;font-size:22px;font-weight:bold;font-family:Georgia,serif;">${fmt(refundAmount)}</span>
      </td></tr>
    </table>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef9c3;border:1px solid #fef08a;border-radius:10px;margin-bottom:24px;">
  <tr><td style="padding:14px 18px;">
    <p style="color:#854d0e;font-size:13px;margin:0;line-height:1.7;font-family:Georgia,serif;">
      ⏰ <strong>Processing Time:</strong> Refunds typically take <strong>5–7 business days</strong> to appear in your account, depending on your bank or payment provider.
    </p>
  </td></tr>
</table>
${ctaButton("Continue Shopping →", `${BASE_URL}/products`)}`;

  return base(content, `Refund of ${fmt(refundAmount)} processed for Order #${orderNumber}`);
}

// ─────────────────────────────────────────────────────────────
// ADMIN: NEW ORDER NOTIFICATION
// ─────────────────────────────────────────────────────────────

export interface AdminNewOrderData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  paymentId?: string | null;
  address: OrderEmailAddress;
  items: OrderEmailItem[];
  orderId: string;
}

export function adminNewOrderTemplate(data: AdminNewOrderData): string {
  const {
    orderNumber, orderDate, customerName, customerEmail, customerPhone,
    subtotal, discount, total, couponCode, paymentMethod, paymentId,
    address, items, orderId,
  } = data;

  const itemRows = items.map((item) => `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #f5efe3;vertical-align:top;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${item.image ? `<td width="52" style="vertical-align:top;padding-right:10px;">
        <img src="${item.image}" width="48" height="58" alt="${item.name}" style="border-radius:5px;display:block;object-fit:cover;" />
      </td>` : ""}
      <td style="vertical-align:top;">
        <p style="color:#2d2d2d;font-size:13px;font-weight:bold;margin:0 0 3px;font-family:Georgia,serif;">${item.name}</p>
        <p style="color:#8d8d8d;font-size:12px;margin:0;font-family:Georgia,serif;">Qty: ${item.quantity}</p>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <p style="color:#550022;font-size:13px;font-weight:bold;margin:0;font-family:Georgia,serif;">${fmt(item.price * item.quantity)}</p>
        <p style="color:#aaa;font-size:11px;margin:2px 0 0;font-family:Georgia,serif;">${fmt(item.price)} each</p>
      </td>
    </tr></table>
  </td>
</tr>`).join("");

  const addrFull = [
    address.name,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    "India",
  ].filter(Boolean).join(", ");

  const content = `
<h1 style="color:#550022;font-size:22px;font-weight:normal;margin:0 0 4px;font-family:Georgia,serif;">🛍️ New Order Received</h1>
<p style="color:#6b6b6b;font-size:13px;margin:0 0 4px;font-family:Georgia,serif;">Order <strong style="color:#550022;">#${orderNumber}</strong> — ${orderDate}</p>
<p style="color:#6b6b6b;font-size:12px;margin:0 0 24px;font-family:Georgia,serif;">A new order has been placed on Mayur Silks.</p>
${divider()}

<!-- Customer Info -->
<h3 style="color:#550022;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Georgia,serif;">Customer Information</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:10px;margin-bottom:16px;">
  <tr><td style="padding:16px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:5px 0;width:40%;"><span style="color:#8d8d8d;font-size:12px;font-family:Georgia,serif;">Name</span></td><td><span style="color:#2d2d2d;font-size:13px;font-weight:bold;font-family:Georgia,serif;">${customerName}</span></td></tr>
      <tr><td style="padding:5px 0;"><span style="color:#8d8d8d;font-size:12px;font-family:Georgia,serif;">Email</span></td><td><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${customerEmail}</span></td></tr>
      ${customerPhone ? `<tr><td style="padding:5px 0;"><span style="color:#8d8d8d;font-size:12px;font-family:Georgia,serif;">Phone</span></td><td><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${customerPhone}</span></td></tr>` : ""}
    </table>
  </td></tr>
</table>

<!-- Shipping Address -->
<h3 style="color:#550022;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Georgia,serif;">Shipping Address</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:10px;margin-bottom:16px;">
  <tr><td style="padding:16px 20px;">
    <p style="color:#2d2d2d;font-size:13px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">${address.name}</p>
    <p style="color:#6b6b6b;font-size:13px;line-height:1.7;margin:0 0 6px;font-family:Georgia,serif;">${addrFull}</p>
    <p style="color:#2d2d2d;font-size:13px;margin:0;font-family:Georgia,serif;">📞 ${address.phone}</p>
  </td></tr>
</table>

<!-- Order Items -->
<h3 style="color:#550022;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Georgia,serif;">Order Items</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${itemRows}</table>

<!-- Pricing -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:10px;margin-bottom:16px;">
  <tr><td style="padding:16px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:4px 0;"><span style="color:#6b6b6b;font-size:13px;font-family:Georgia,serif;">Subtotal</span></td><td style="text-align:right;"><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${fmt(subtotal)}</span></td></tr>
      ${discount > 0 ? `<tr><td style="padding:4px 0;"><span style="color:#16a34a;font-size:13px;font-family:Georgia,serif;">Discount${couponCode ? ` (${couponCode})` : ""}</span></td><td style="text-align:right;"><span style="color:#16a34a;font-size:13px;font-family:Georgia,serif;">−${fmt(discount)}</span></td></tr>` : ""}
      <tr><td style="padding:4px 0;"><span style="color:#6b6b6b;font-size:13px;font-family:Georgia,serif;">Shipping</span></td><td style="text-align:right;"><span style="color:#16a34a;font-size:13px;font-weight:bold;font-family:Georgia,serif;">FREE</span></td></tr>
      <tr><td style="padding-top:10px;border-top:1px solid #ede0cb;"><span style="color:#550022;font-size:15px;font-weight:bold;font-family:Georgia,serif;">Total</span></td><td style="text-align:right;padding-top:10px;border-top:1px solid #ede0cb;"><span style="color:#550022;font-size:15px;font-weight:bold;font-family:Georgia,serif;">${fmt(total)}</span></td></tr>
    </table>
  </td></tr>
</table>

<!-- Payment -->
<h3 style="color:#550022;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Georgia,serif;">Payment Details</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:8px;">
  <tr><td style="padding:14px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:3px 0;width:40%;"><span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Method</span></td><td><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${paymentMethod === "razorpay" ? "Online (Razorpay)" : paymentMethod}</span></td></tr>
      ${paymentId ? `<tr><td style="padding:3px 0;"><span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Payment ID</span></td><td><span style="color:#2d2d2d;font-size:12px;font-family:monospace;">${paymentId}</span></td></tr>` : ""}
      <tr><td style="padding:3px 0;"><span style="color:#6b6b6b;font-size:12px;font-family:Georgia,serif;">Status</span></td><td><span style="color:#16a34a;font-size:13px;font-weight:bold;font-family:Georgia,serif;">✓ Paid</span></td></tr>
    </table>
  </td></tr>
</table>

${ctaButton("View in Admin Panel →", `${BASE_URL}/admin/orders/${orderId}`)}`;

  return base(content, `New Order #${orderNumber} — ${customerName} — ${fmt(total)}`);
}

// ─────────────────────────────────────────────────────────────
// ADMIN: LOW STOCK ALERT
// ─────────────────────────────────────────────────────────────

export interface AdminLowStockData {
  productName: string;
  sku: string;
  currentStock: number;
  productId: string;
}

export function adminLowStockTemplate(data: AdminLowStockData): string {
  const { productName, sku, currentStock, productId } = data;
  const content = `
<h1 style="color:#d97706;font-size:22px;font-weight:normal;margin:0 0 4px;font-family:Georgia,serif;">⚠️ Low Stock Alert</h1>
<p style="color:#6b6b6b;font-size:13px;margin:0 0 24px;font-family:Georgia,serif;">Restock required for the following product.</p>
${divider()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 24px;">
    <p style="color:#8d8d8d;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;font-family:Georgia,serif;">Product</p>
    <p style="color:#2d2d2d;font-size:15px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">${productName}</p>
    <p style="color:#8d8d8d;font-size:12px;margin:0 0 16px;font-family:Georgia,serif;">SKU: ${sku}</p>
    <div style="display:inline-block;background:#d97706;color:#ffffff;font-size:13px;font-weight:bold;padding:8px 20px;border-radius:50px;font-family:Georgia,serif;">
      Current Stock: ${currentStock} ${currentStock === 1 ? "unit" : "units"}
    </div>
  </td></tr>
</table>
${ctaButton("Update Inventory →", `${BASE_URL}/admin/inventory?product=${productId}`)}`;

  return base(content, `⚠️ Low Stock: ${productName} — only ${currentStock} units remaining`);
}

// ─────────────────────────────────────────────────────────────
// ADMIN: OUT OF STOCK ALERT
// ─────────────────────────────────────────────────────────────

export interface AdminOutOfStockData {
  productName: string;
  sku: string;
  productId: string;
}

export function adminOutOfStockTemplate(data: AdminOutOfStockData): string {
  const { productName, sku, productId } = data;
  const content = `
<h1 style="color:#dc2626;font-size:22px;font-weight:normal;margin:0 0 4px;font-family:Georgia,serif;">🚨 Out of Stock Alert</h1>
<p style="color:#6b6b6b;font-size:13px;margin:0 0 24px;font-family:Georgia,serif;">Immediate restock required — this product is now unavailable.</p>
${divider()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 24px;">
    <p style="color:#991b1b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;font-family:Georgia,serif;">Product</p>
    <p style="color:#2d2d2d;font-size:15px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">${productName}</p>
    <p style="color:#8d8d8d;font-size:12px;margin:0 0 16px;font-family:Georgia,serif;">SKU: ${sku}</p>
    <div style="display:inline-block;background:#dc2626;color:#ffffff;font-size:13px;font-weight:bold;padding:8px 20px;border-radius:50px;font-family:Georgia,serif;">
      🚫 Stock: 0 units
    </div>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef9c3;border:1px solid #fef08a;border-radius:10px;margin-bottom:24px;">
  <tr><td style="padding:12px 16px;">
    <p style="color:#854d0e;font-size:12px;margin:0;font-family:Georgia,serif;">
      This product has been automatically marked as <strong>Out of Stock</strong> on the storefront. Customers cannot purchase it until inventory is restocked.
    </p>
  </td></tr>
</table>
${ctaButton("Update Inventory →", `${BASE_URL}/admin/inventory?product=${productId}`)}`;

  return base(content, `🚨 Out of Stock: ${productName} — immediate restock required`);
}

// ─────────────────────────────────────────────────────────────
// ADMIN: PAYMENT FAILED ALERT
// ─────────────────────────────────────────────────────────────

export interface AdminPaymentFailedData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  reason: string;
}

export function adminPaymentFailedTemplate(data: AdminPaymentFailedData): string {
  const { customerName, customerEmail, orderId, reason } = data;
  const content = `
<h1 style="color:#dc2626;font-size:22px;font-weight:normal;margin:0 0 4px;font-family:Georgia,serif;">💳 Payment Failure Alert</h1>
<p style="color:#6b6b6b;font-size:13px;margin:0 0 24px;font-family:Georgia,serif;">A customer's payment attempt has failed.</p>
${divider()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:16px;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:6px 0;width:40%;"><span style="color:#8d8d8d;font-size:12px;font-family:Georgia,serif;">Customer</span></td><td><span style="color:#2d2d2d;font-size:13px;font-weight:bold;font-family:Georgia,serif;">${customerName}</span></td></tr>
      <tr><td style="padding:6px 0;"><span style="color:#8d8d8d;font-size:12px;font-family:Georgia,serif;">Email</span></td><td><span style="color:#2d2d2d;font-size:13px;font-family:Georgia,serif;">${customerEmail}</span></td></tr>
      <tr><td style="padding:6px 0;"><span style="color:#8d8d8d;font-size:12px;font-family:Georgia,serif;">Order Ref</span></td><td><span style="color:#2d2d2d;font-size:12px;font-family:monospace;">${orderId}</span></td></tr>
    </table>
  </td></tr>
</table>
<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
  <p style="color:#991b1b;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;font-family:Georgia,serif;">Failure Reason</p>
  <p style="color:#4a4a4a;font-size:13px;margin:0;line-height:1.6;font-family:Georgia,serif;">${reason}</p>
</div>
<p style="color:#6b6b6b;font-size:12px;line-height:1.7;margin:0 0 24px;font-family:Georgia,serif;">
  No action is required — no order was created. The customer's cart is preserved and they can retry the payment. You may follow up with the customer if needed.
</p>
${ctaButton("View Orders Dashboard →", `${BASE_URL}/admin/orders`)}`;

  return base(content, `Payment failed for ${customerName} — ${reason}`);
}

// ─────────────────────────────────────────────────────────────
// ADMIN: DAILY SUMMARY
// ─────────────────────────────────────────────────────────────

export interface AdminDailySummaryData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
  cancelledOrders: number;
}

export function adminDailySummaryTemplate(data: AdminDailySummaryData): string {
  const { date, totalOrders, totalRevenue, newCustomers, cancelledOrders } = data;

  const statCard = (label: string, value: string, color: string) =>
    `<td style="text-align:center;padding:0 8px;"><div style="background:#ffffff;border-radius:10px;padding:16px 12px;border:1px solid #ede0cb;"><p style="color:${color};font-size:20px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">${value}</p><p style="color:#8d8d8d;font-size:11px;margin:0;text-transform:uppercase;letter-spacing:1px;font-family:Georgia,serif;">${label}</p></div></td>`;

  const content = `
<h1 style="color:#550022;font-size:22px;font-weight:normal;margin:0 0 4px;font-family:Georgia,serif;">📊 Daily Sales Summary</h1>
<p style="color:#6b6b6b;font-size:13px;margin:0 0 24px;font-family:Georgia,serif;">${date}</p>
${divider()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${statCard("Total Orders", String(totalOrders), "#550022")}
      ${statCard("Revenue", fmt(totalRevenue), "#16a34a")}
      ${statCard("New Customers", String(newCustomers), "#2563eb")}
      ${statCard("Cancelled", String(cancelledOrders), "#dc2626")}
    </tr></table>
  </td></tr>
</table>
${ctaButton("View Admin Dashboard →", `${BASE_URL}/admin`)}`;

  return base(content, `Daily Summary — ${date} — ${totalOrders} orders — ${fmt(totalRevenue)} revenue`);
}
