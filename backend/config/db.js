const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool sizing for concurrent traffic. Each pooled connection
      // is reused across requests instead of opening a new one every time -
      // this is the single biggest lever for handling many simultaneous
      // users, since without it Node queues DB calls behind a tiny default
      // pool. 50 is a reasonable ceiling for a single backend instance on a
      // low/mid MongoDB Atlas tier; raise it if Atlas metrics show connection
      // wait time, lower it if you're hitting Atlas's own connection limit.
      maxPoolSize: 50,
      minPoolSize: 5,
      // Fail fast instead of hanging if Atlas is briefly unreachable, so a
      // burst of concurrent requests doesn't all pile up waiting forever.
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       // modern mongoose (8.x) doesn't need extra options, but kept explicit for clarity
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
