import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import index from "./index.html";
import { computeBitSlow } from "./bitslow";

// Initialize the database
const db = new Database(":memory:");

seedDatabase(db, {
  clientCount: 30,
  bitSlowCount: 20,
  transactionCount: 50,
  clearExisting: true,
});

type TransactionRow = {
  bit1: number;
  bit2: number;
  bit3: number;
  [key: string]: any;
};

// Start the server
const server = serve({
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    console.log(" Incoming request:", method, pathname);

    // /api/transactions
    if (pathname === "/api/transactions" && method === "GET") {
      try {
        const transactions = db
          .query(`
            SELECT 
              t.id, 
              t.coin_id, 
              t.amount, 
              t.transaction_date,
              seller.id as seller_id,
              seller.name as seller_name,
              buyer.id as buyer_id,
              buyer.name as buyer_name,
              c.bit1,
              c.bit2,
              c.bit3,
              c.value
            FROM transactions t
            LEFT JOIN clients seller ON t.seller_id = seller.id
            JOIN clients buyer ON t.buyer_id = buyer.id
            JOIN coins c ON t.coin_id = c.coin_id
            ORDER BY t.transaction_date DESC
          `)
          .all();

        const enhancedTransactions = (transactions as TransactionRow[]).map(
          (transaction) => ({
            ...transaction,
            computedBitSlow: computeBitSlow(
              transaction.bit1,
              transaction.bit2,
              transaction.bit3
            ),
          })
        );

        return Response.json(enhancedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return new Response("Error fetching transactions", { status: 500 });
      }
    }

    // /api/register
    if (pathname === "/api/register" && method === "POST") {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return Response.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const bcrypt = await import("bcryptjs");
      const hashedPassword = bcrypt.hashSync(password, 10);

      try {
        db.query("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
        return Response.json({ message: "User registered successfully" }, { status: 201 });
      } catch (err) {
        console.error("Register error:", err);
        return Response.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    // /api/login
    if (pathname === "/api/login" && method === "POST") {
      const body = await req.json();
      const { email, password } = body;

      const bcrypt = await import("bcryptjs");

      const user = db
        .query("SELECT * FROM users WHERE email = ?")
        .get(email) as { id: number; password: string } | undefined;

      console.log(" Login attempt for:", email);
      console.log("User found:", user);

      if (!user || !bcrypt.compareSync(password, user.password)) {
        console.log(" Invalid login");
        return Response.json({ error: "Invalid credentials" }, { status: 401 });
      }

      console.log(" Login success for userId:", user.id);
      return Response.json({ userId: user.id });
    }

    // fallback index.html
    return new Response(index, {
      headers: { "Content-Type": "text/html" },
    });
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(` Server running at ${server.url}`);
