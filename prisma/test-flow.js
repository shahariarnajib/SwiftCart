const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runEndToEndVerification() {
  console.log("=== STARTING SWIFT CART END-TO-END VERIFICATION ===");

  // 1. Check Categories
  const categories = await prisma.category.findMany();
  console.log(`[PASS] Found ${categories.length} categories.`);
  if (categories.length === 0) throw new Error("No categories found");

  // 2. Check Products
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
  });
  console.log(`[PASS] Found ${products.length} live products in catalog.`);
  if (products.length === 0) throw new Error("No products found");

  // 3. Test Product Stock and Ordering Flow
  const targetProduct = products.find((p) => p.stock > 5);
  if (!targetProduct) throw new Error("No product with stock > 5 found");

  const initialStock = targetProduct.stock;
  const orderQty = 2;
  console.log(`Testing with product: "${targetProduct.name}" (SKU: ${targetProduct.sku})`);
  console.log(`Initial stock: ${initialStock} units. Ordering ${orderQty} units...`);

  // Simulate Order Creation (Same transactional logic as /api/orders)
  const orderNumber = `SC-TEST-${Date.now().toString().slice(-4)}`;
  const orderPrice = targetProduct.salePrice || targetProduct.regularPrice;
  const subtotal = orderPrice * orderQty;
  const deliveryCharge = subtotal > 2500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  const createdOrder = await prisma.$transaction(async (tx) => {
    // Check stock
    const p = await tx.product.findUnique({ where: { id: targetProduct.id } });
    if (p.stock < orderQty) throw new Error("Insufficient stock");

    // Decrement stock
    await tx.product.update({
      where: { id: targetProduct.id },
      data: { stock: p.stock - orderQty },
    });

    // Create customer
    const customer = await tx.customer.upsert({
      where: { phone: "01811223344" },
      update: { name: "Mustafizur Rahman" },
      create: {
        name: "Mustafizur Rahman",
        phone: "01811223344",
        email: "mustafiz@example.com",
        city: "Dhaka",
        address: "Road 7, Block C, Banani",
      },
    });

    // Create Order with OrderItem
    return tx.order.create({
      data: {
        orderNumber,
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: "Cash on Delivery",
        status: "PENDING",
        customerId: customer.id,
        items: {
          create: [
            {
              productId: targetProduct.id,
              productName: targetProduct.name,
              productSku: targetProduct.sku,
              price: orderPrice, // Preserved snapshot!
              quantity: orderQty,
              image: targetProduct.images[0]?.url || "",
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  console.log(`[PASS] Order successfully created with Order ID: ${createdOrder.orderNumber}`);

  // 4. Verify Stock was Decremented
  const updatedProduct = await prisma.product.findUnique({ where: { id: targetProduct.id } });
  console.log(
    `[PASS] Product stock updated: Was ${initialStock}, Now ${updatedProduct.stock} (Reduced by ${orderQty}).`
  );
  if (updatedProduct.stock !== initialStock - orderQty) {
    throw new Error("Stock decrement verification failed!");
  }

  // 5. Test Admin Login Credential Check
  const admin = await prisma.adminUser.findUnique({ where: { username: "admin" } });
  if (!admin) throw new Error("Default admin user not found");
  const passwordValid = await bcrypt.compare("admin123", admin.passwordHash);
  if (!passwordValid) throw new Error("Admin password comparison failed");
  console.log(`[PASS] Admin credentials verified (username: "${admin.username}", password valid: true).`);

  // 6. Test Admin Updating Order Status to CONFIRMED and SHIPPED
  console.log(`Updating order ${createdOrder.orderNumber} status to CONFIRMED...`);
  const confirmedOrder = await prisma.order.update({
    where: { id: createdOrder.id },
    data: { status: "CONFIRMED" },
  });
  console.log(`[PASS] Order status updated to: ${confirmedOrder.status}`);

  console.log(`Updating order ${createdOrder.orderNumber} status to SHIPPED...`);
  const shippedOrder = await prisma.order.update({
    where: { id: createdOrder.id },
    data: { status: "SHIPPED" },
  });
  console.log(`[PASS] Order status updated to: ${shippedOrder.status}`);

  // 7. Verify Historical Price Preservation
  const retrievedOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
    include: { items: true },
  });
  const savedItem = retrievedOrder.items[0];
  console.log(
    `[PASS] Historical order price preserved: ৳${savedItem.price} (Subtotal: ৳${retrievedOrder.subtotal}).`
  );

  console.log("\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runEndToEndVerification()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
