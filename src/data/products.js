const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    description:
      "Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 249.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    description:
      "Feature-rich smartwatch with fitness tracking, heart rate monitor, and smartphone notifications. Water-resistant design.",
  },
  {
    id: 3,
    name: "Laptop Stand",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1623251606108-512c7c4a3507?w=500&h=500&fit=crop",
    description:
      "Ergonomic aluminum laptop stand that improves posture and workspace organization. Adjustable height and angle.",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop",
    description:
      "RGB backlit mechanical keyboard with Cherry MX switches. Perfect for gaming and typing enthusiasts.",
  },
  {
    id: 5,
    name: "USB-C Hub",
    price: 39.99,
    image:
      "https://plus.unsplash.com/premium_photo-1761043248662-42f371ad31b4?w=500&h=500&fit=crop",
    description:
      "Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader. Expand your laptop connectivity.",
  },
  {
    id: 6,
    name: "Wireless Mouse",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
    description:
      "Ergonomic wireless mouse with precision tracking and long battery life. Comfortable for extended use.",
  },
  {
    id: 7,
    name: "Monitor Stand",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1545446968-9baea3c7a4db?w=500&h=500&fit=crop",
    description:
      "Dual monitor stand with adjustable height and tilt. Frees up desk space and improves ergonomics.",
  },
  {
    id: 8,
    name: "Webcam HD",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=500&h=500&fit=crop",
    description:
      "1080p HD webcam with auto-focus and built-in microphone. Ideal for video calls and streaming.",
  },
  {
    id: 9,
    name: "External Hard Drive",
    price: 119.99,
    image:
      "https://images.unsplash.com/photo-1756836857570-127b0408b676?w=500&h=500&fit=crop",
    description:
      "External hard drive with 2TB storage capacity. Fast data transfer and reliable backup solution.",
  },
  {
    id: 10,
    name: "JBL Bluetooth Speaker",
    price: 59.99,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    description:
      "Portable JBL Bluetooth speaker with powerful sound and long battery life. Perfect for outdoor and indoor use.",
  },
  {
    id: 11,
    name: "Gaming Chair",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1670946839270-cc4febd43b09?w=500&h=500&fit=crop",
    description:
      "Ergonomic gaming chair with adjustable height and lumbar support. Perfect for long gaming sessions.",
  },
  {
    id: 12,
    name: "Monitor",
    price: 399.99,
    image:
      "https://plus.unsplash.com/premium_photo-1680721575441-18d5a0567269?w=500&h=500&fit=crop",
    description:
      "High-resolution monitor with 4K display and vibrant colors. Ideal for gaming, design, and productivity.",
  },
];

export function getProducts() {
  return products;
}

export function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}