const Transaction = require("../models/Transaction");

function encodeCursor(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

function decodeCursor(str) {
  try {
    return JSON.parse(Buffer.from(str, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

async function listTransactions(req, res) {
  try {
    const userId = req.user._id;

    // Existing filters
    const { type, direction } = req.query;

    // NEW: pagination params
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const cursor = req.query.cursor ? decodeCursor(req.query.cursor) : null;

    let query = {};

    // 1) Filter by transaction type if provided
    if (type) query.type = type;

    // 2) Direction logic for transfers
    if (direction === "sent") {
      query.sender = userId;
      query.type = "transfer";
    } else if (direction === "received") {
      query.receiver = userId;
      query.type = "transfer";
    } else {
      query.$or = [{ sender: userId }, { receiver: userId }];
    }

    // 3) Cursor pagination (newest -> oldest)
    if (cursor && cursor.createdAt && cursor._id) {
      const cursorCreatedAt = new Date(cursor.createdAt);
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { createdAt: { $lt: cursorCreatedAt } },
            { createdAt: cursorCreatedAt, _id: { $lt: cursor._id } },
          ],
        },
      ];
    }

    // 4) Fetch (limit + 1 to detect hasMore)
    const txs = await Transaction.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate("sender", "fullName email")
      .populate("receiver", "fullName email");

    const hasMore = txs.length > limit;
    const page = hasMore ? txs.slice(0, limit) : txs;

    const last = page[page.length - 1];
    const nextCursor = last
      ? encodeCursor({ createdAt: last.createdAt, _id: String(last._id) })
      : null;

    return res.status(200).json({
      success: true,
      transactions: page,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("List Transactions Error:", error);
    return res.status(500).json({
      message: "Could not retrieve transaction history",
    });
  }
}

module.exports = { listTransactions };
