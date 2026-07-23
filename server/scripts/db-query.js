const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "..", "data", "typezone.sqlite");
const db = new Database(dbPath);

// Helper function to execute SQL query
function executeQuery(sql) {
  try {
   const stmt = db.prepare(sql);
    if (stmt.reader) {
      return stmt.all();
    } else {
     const result = stmt.run();
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    }
  } catch (error) {
   console.error("Error executing query:", error.message);
    return null;
  }
}

// Helper function to export data to JSON file
function exportToJSON(data, filename) {
  const outputPath = path.resolve(__dirname, "..", "exports", filename);
  
  // Ensure exports directory exists
  const exportsDir = path.dirname(outputPath);
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✓ Data exported to: ${outputPath}`);
  return outputPath;
}

// Helper function to export data to CSV file
function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
   console.log("No data to export");
    return null;
  }
  
  const outputPath = path.resolve(__dirname, "..", "exports", filename);
  
  // Ensure exports directory exists
  const exportsDir = path.dirname(outputPath);
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === "string" && value.includes(",") ? `"${value}"` : value
    ).join(",")
  );
  
  const csv = [headers, ...rows].join("\n");
  fs.writeFileSync(outputPath, csv);
  console.log(`✓ Data exported to: ${outputPath}`);
  return outputPath;
}

// Main execution
console.log("=== TypeZone Database Query Tool ===\n");

// Example queries
const queries = [
  {
    name: "All Tables",
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    export: false
  },
  {
    name: "Users Count",
    sql: "SELECT COUNT(*) as total_users FROM users",
    export: false
  },
  {
    name: "All Users",
    sql: "SELECT id, username, email, full_name, created_at FROM users",
    export: true
  },
  {
    name: "Top 10 Scores by WPM",
    sql: `
      SELECT u.username, s.mode, s.level, s.wpm, s.accuracy, s.errors, s.updated_at
      FROM scores s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.wpm DESC
      LIMIT 10
    `,
    export: true
  },
  {
    name: "Password Resets",
    sql: `
      SELECT pr.id, u.username, pr.token, pr.expires_at, pr.used, pr.created_at
      FROM password_resets pr
      JOIN users u ON u.id = pr.user_id
      ORDER BY pr.created_at DESC
    `,
    export: true
  }
];

queries.forEach((query, index) => {
  console.log(`\n--- ${index + 1}. ${query.name} ---`);
  console.log(`SQL: ${query.sql.trim()}\n`);
  
  const result = executeQuery(query.sql);
  
  if (result) {
   console.log("Result:", result);
    
    if (query.export && result.length > 0) {
     const safeName = query.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
     const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      
      // Export to JSON
      exportToJSON(result, `${safeName}_${timestamp}.json`);
      
      // Export to CSV
      exportToCSV(result, `${safeName}_${timestamp}.csv`);
    }
  }
});

console.log("\n=== Export Complete ===");
console.log("Check the 'server/exports/' folder for exported files.");

db.close();
