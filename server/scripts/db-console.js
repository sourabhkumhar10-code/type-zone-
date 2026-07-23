const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");
const readline = require("readline");

const dbPath = path.resolve(__dirname, "..", "data", "typezone.sqlite");
const db = new Database(dbPath);

// Ensure exports directory exists
const exportsDir = path.resolve(__dirname, "..", "exports");
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== TypeZone Interactive Database Console ===\n");
console.log("Commands:");
console.log("  .tables                    - List all tables");
console.log("  .schema <table>            - Show table structure");
console.log("  .export <query>            - Export query result to JSON & CSV");
console.log("  .help                      - Show this help");
console.log("  .exit                      - Exit console\n");
console.log("Enter any SQL query (SELECT, INSERT, UPDATE, DELETE, etc.)\n");

function showTables() {
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all();
  console.log("\nTables:", tables.map(t => t.name).join(", "));
}

function showSchema(tableName) {
  if (!tableName) {
  console.log("Usage: .schema <table_name>");
    return;
  }
  
  const schema = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name=?"
  ).get(tableName);
  
  if (schema) {
  console.log(`\nSchema for '${tableName}':`);
   console.log(schema.sql);
  } else {
  console.log(`Table '${tableName}' not found`);
  }
}

function executeQuery(sql) {
  try {
  const stmt = db.prepare(sql);
   const startTime = Date.now();
    
    if (stmt.reader) {
     const result = stmt.all();
    const endTime = Date.now();
     console.log(`\n✓ Query executed in ${endTime - startTime}ms`);
     console.log(`Rows: ${result.length}\n`);
      
      if (result.length > 0) {
      console.table(result);
      }
      
      return result;
    } else {
    const result = stmt.run();
    const endTime = Date.now();
     console.log(`\n✓ Query executed in ${endTime - startTime}ms`);
     console.log(`Changes: ${result.changes}`);
      if (result.lastInsertRowid) {
      console.log(`Last Insert ID: ${result.lastInsertRowid}`);
      }
      return result;
    }
  } catch (error) {
  console.error("\n❌ Error:", error.message);
    return null;
  }
}

function exportData(sql) {
  try {
  const stmt = db.prepare(sql);
   const result = stmt.all();
    
    if (!result || result.length === 0) {
    console.log("No data to export");
      return;
    }
    
   const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
   const filename = `export_${timestamp}`;
    
    // Export to JSON
   const jsonPath = path.resolve(exportsDir, `${filename}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
   console.log(`✓ Exported to JSON: ${jsonPath}`);
    
    // Export to CSV
   const headers = Object.keys(result[0]).join(",");
   const rows = result.map(row => 
      Object.values(row).map(value => 
        typeof value === "string" && value.includes(",") ? `"${value}"` : value
      ).join(",")
    );
   const csv = [headers, ...rows].join("\n");
   const csvPath = path.resolve(exportsDir, `${filename}.csv`);
    fs.writeFileSync(csvPath, csv);
   console.log(`✓ Exported to CSV: ${csvPath}`);
    
  } catch (error) {
  console.error("❌ Export failed:", error.message);
  }
}

function prompt() {
  rl.question("sql> ", (input) => {
  const trimmed = input.trim();
    
    if (!trimmed) {
     prompt();
      return;
    }
    
    if (trimmed === ".exit" || trimmed === ".quit") {
     db.close();
    console.log("\nGoodbye!");
     rl.close();
      return;
    }
    
    if (trimmed === ".tables") {
     showTables();
     prompt();
      return;
    }
    
    if (trimmed.startsWith(".schema")) {
    const tableName = trimmed.split(" ")[1];
     showSchema(tableName);
     prompt();
      return;
    }
    
    if (trimmed === ".help") {
    console.log("\nCommands:");
    console.log("  .tables                    - List all tables");
    console.log("  .schema <table>            - Show table structure");
    console.log("  .export <query>            - Export query result to JSON & CSV");
    console.log("  .help                      - Show this help");
    console.log("  .exit                      - Exit console\n");
     prompt();
      return;
    }
    
    if (trimmed.startsWith(".export ")) {
    const query = trimmed.substring(8);
     exportData(query);
     prompt();
      return;
    }
    
    // Execute regular SQL query
    executeQuery(trimmed);
    prompt();
  });
}

prompt();
