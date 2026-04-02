# 🚀 AI Product Search System

A backend system that allows users to search products using **natural language queries** like:

> "cheap red shoes under 3000"

The system intelligently parses the query and returns relevant results using **Node.js, Express, Sequelize, and MySQL**.

---

# 🧠 Features

## 🔐 Authentication

* User Registration
* User Login
* JWT-based Authentication
* Password hashing using bcrypt
* Joi validation for request validation

---

## 🔍 AI-Based Search

* Natural Language Query Parsing
* Extracts:

  * Category
  * Color
  * Price
  * Keywords
* Dynamic filtering using Sequelize ORM

---

## ⚙️ Search Capabilities

* Pagination
* Sorting (price, name, createdAt)
* Case-insensitive filtering
* Multiple filters support

---

## 🗄️ Database

* MySQL database
* Sequelize ORM
* Models:

  * Users
  * Products
  * Categories
* Proper relationships:

  * Category → Products

---

## 🌱 Seeder

* Preloaded categories and products
* Ensures test-ready data

---

## 🔐 Role-Based Access Control

* Roles:

  * Super Admin (0)
  * Admin (1)
  * User (2)
* Only Admin can:

  * Create products
  * Update products
  * Delete products

---

# 📁 Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── seeders/
├── validators/
├── app.js
└── server.js
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd project
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Setup Environment Variables

Create `.env` file:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_product_search
DB_USER=root
DB_PASSWORD=yourpassword

JWT_SECRET=your_secret
JWT_EXPIRES=1d

JWT_SECRET=supersecretkey123
JWT_EXPIRES=1d


REFRESH_TOKEN_SECRET=refreshsecretkey123
REFRESH_TOKEN_EXPIRES=7d

BCRYPT_SALT_ROUNDS=10

LOG_LEVEL=debug


CLIENT_URL=http://localhost:3000


AI_PROVIDER=openai   # or ollama

OPENAI_API_KEY=your_openai_key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## 4️⃣ Run Server

```bash
npm run dev
```

---

# 🔌 API Endpoints

---

## 🔐 Auth APIs

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## 🔍 Search API

```http
GET /api/search?q=red shoes under 3000
```

### Query Params

| Param  | Description              |
| ------ | ------------------------ |
| q      | search query             |
| page   | page number              |
| limit  | items per page           |
| sortBy | price / name / createdAt |
| order  | ASC / DESC               |

---

## 📦 Product APIs

### Get All Products

```http
GET /api/products
```

### Create Product (Admin only)

```http
POST /api/products
```

### Update Product

```http
PUT /api/products/:id
```

### Delete Product

```http
DELETE /api/products/:id
```

---

# 🧪 Example Search

```http
GET /api/search?q=red shoes under 3000
```

### Response

```json
{
  "success": true,
  "total": 1,
  "results": [
    {
      "name": "Nike Air Max",
      "price": 2500,
      "color": "red"
    }
  ]
}
```

---

# ⚠️ Edge Cases Handled

* Empty query
* Invalid query
* No results found
* Multiple filters

---

# 🎯 Bonus Features

* Pagination
* Sorting
* Clean architecture (MVC)
* Scalable design

---

# 🧠 Tech Stack

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* JWT
* Joi

---

# 🚀 Future Improvements

* Redis caching
* Full-text search
* AI-based ranking
* ElasticSearch integration

---

# 🧠 Approach

1. Parse natural language query
2. Convert into structured filters
3. Build dynamic Sequelize query
4. Fetch and return results

---

# 📌 Author

Developed by **Neeraj Pandey**

---
