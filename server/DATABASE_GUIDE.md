# TypeZone Database Query & Export Guide

## 📊 Database Location
```
c:\Users\ADMIN\OneDrive\Documents\New folder\server\data\typezone.sqlite
```

---

## 🚀 Quick Start Commands

### 1. Run Pre-defined Queries with Auto-Export
Executes multiple useful queries and automatically exports to JSON & CSV:
```powershell
cd "c:\Users\ADMIN\OneDrive\Documents\New folder\server"
node scripts/db-query.js
```

**What it exports:**
- All users data
- Top 10 scores by WPM
- Password reset records
- Table list

**Output location:** `server/exports/`

---

### 2. Interactive SQL Console (RECOMMENDED) ⭐
Run custom SQL queries interactively:
```powershell
cd "c:\Users\ADMIN\OneDrive\Documents\New folder\server"
node scripts/db-console.js
```

**Available Commands:**
```
.tables                    - List all tables
.schema <table>            - Show table structure
.export <query>            - Export query result to JSON & CSV
.help                      - Show help
.exit                      - Exit console
```

**Example Usage:**
```sql
sql> SELECT * FROM users;
sql> SELECT COUNT(*) FROM scores;
sql> .export SELECT * FROM users WHERE created_at > '2026-01-01';
sql> .schema users
sql> .tables
sql> .exit
```

---

## 📁 Exported File Formats

### JSON Format
- Human-readable
- Preserves data types
- Easy to parse programmatically
- Location: `server/exports/*.json`

### CSV Format
- Opens in Excel/Google Sheets
- Universal compatibility
- Easy to analyze in spreadsheet tools
- Location: `server/exports/*.csv`

---

## 🔍 Useful SQL Queries

### View All Users
```sql
SELECT id, username, email, full_name, created_at FROM users;
```

### Count Users
```sql
SELECT COUNT(*) as total_users FROM users;
```

### Top Scores Leaderboard
```sql
SELECT u.username, s.mode, s.level, s.wpm, s.accuracy, s.errors, s.updated_at
FROM scores s
JOIN users u ON u.id = s.user_id
ORDER BY s.wpm DESC
LIMIT 10;
```

### User Registration Trend
```sql
SELECT 
  DATE(created_at) as registration_date,
  COUNT(*) as new_users
FROM users
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;
```

### Game Statistics Summary
```sql
SELECT 
  mode,
  level,
  COUNT(*) as total_games,
  AVG(wpm) as avg_wpm,
  AVG(accuracy) as avg_accuracy,
  MAX(wpm) as highest_wpm
FROM scores
GROUP BY mode, level;
```

### Find Inactive Users (No Scores)
```sql
SELECT u.id, u.username, u.email, u.created_at
FROM users u
LEFT JOIN scores s ON u.id = s.user_id
WHERE s.user_id IS NULL;
```

### Recent Password Resets
```sql
SELECT pr.*, u.username, u.email
FROM password_resets pr
JOIN users u ON u.id = pr.user_id
ORDER BY pr.created_at DESC;
```

---

## 🛠️ Manual Database Access Tools

### DB Browser for SQLite (GUI)
1. Download: https://sqlitebrowser.org/dl/
2. Open database: `server/data/typezone.sqlite`
3. Browse tables visually
4. Execute SQL queries
5. Export data manually

### SQLite Command Line
```powershell
cd "c:\Users\ADMIN\OneDrive\Documents\New folder\server\data"
sqlite3 typezone.sqlite

# Then use SQLite commands:
.tables
.schema users
SELECT * FROM users;
.quit
```

---

## 📊 Database Schema

### Tables:
1. **users** - User accounts
2. **scores** - Game scores/leaderboard
3. **password_resets** - Password reset tokens

### View Schema in Console:
```sql
sql> .schema users
sql> .schema scores
sql> .schema password_resets
```

---

## 💡 Tips

1. **Auto-export**: The `db-query.js` script automatically exports to both JSON and CSV
2. **Timestamps**: Exported files include timestamps to prevent overwriting
3. **Interactive mode**: Use `db-console.js` for experimentation
4. **Backup**: Always backup your database before running UPDATE/DELETE operations
5. **WAL Mode**: Database uses Write-Ahead Logging for better performance

---

## 🎯 Common Tasks

### Export All Data
```powershell
node scripts/db-query.js
```

### Check Total Users
```powershell
node scripts/db-console.js
# Then type: SELECT COUNT(*) FROM users;
```

### Find Specific User
```powershell
node scripts/db-console.js
# Then type: SELECT * FROM users WHERE username = 'sk8652';
```

### Export Leaderboard
```powershell
node scripts/db-console.js
# Then type: .export SELECT u.username, s.wpm, s.accuracy FROM scores s JOIN users u ON u.id = s.user_id ORDER BY s.wpm DESC;
```

---

## 📝 Current Database Status (as of execution)
- **Total Users**: 6
- **Scores Records**: 0 (no games played yet)
- **Password Resets**: 0

---

**Created**: 2026-03-10
**Database**: SQLite (better-sqlite3)
**Backend**: Node.js + Express
