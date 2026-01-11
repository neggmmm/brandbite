async function testImport() {
  try {
    console.log("Testing table routes import...");
    const tableRoutes = await import("./src/modules/tableBooking/table.routes.js");
    console.log("✓ Table routes imported");
    
    console.log("Testing booking routes import...");
    const bookingRoutes = await import("./src/modules/tableBooking/booking.routes.js");
    console.log("✓ Booking routes imported");
    
    console.log("All imports successful!");
  } catch (err) {
    console.error("Import error:", err.message);
    console.error(err.stack);
  }
}

testImport();
