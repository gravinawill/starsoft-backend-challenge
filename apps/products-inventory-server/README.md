# Products Inventory Microservice

## Features

### Product

| Attribute              | Type               | Description                      |
| ---------------------- | ------------------ | -------------------------------- |
| id                     | `uuid`             | Unique product identifier        |
| name                   | `string`           | Product name                     |
| price_in_cents         | `number`           | Price in cents                   |
| image_url              | `string \| null`   | Optional product image           |
| available_count        | `number`           | Number of items in stock         |
| unavailable_count      | `number`           | Number of reserved/unavailable   |
| created_by_employee_id | `uuid`             | Employee who created the product |
| created_at             | `datetime`         | Creation timestamp               |
| updated_at             | `datetime`         | Last update timestamp            |
| deleted_at             | `datetime \| null` | Soft deletion timestamp          |

#### API Endpoints

- [ ] `POST /products` — Create a new product
- [ ] `PATCH /products/:id/image` — Upload product image

#### Events

- [ ] `product.reserved` — Reserve products for an order
- [ ] `product.reservation_cancelled` — Cancel a product reservation

---

### Order

| Attribute              | Type               | Description                        |
| ---------------------- | ------------------ | ---------------------------------- |
| id                     | `uuid`             | Unique order identifier            |
| is_reservation         | `boolean`          | Whether this is a reservation      |
| reservation_expires_at | `datetime \| null` | Reservation expiry (if applicable) |
| created_at             | `datetime`         | Creation timestamp                 |
| updated_at             | `datetime`         | Last update timestamp              |
| deleted_at             | `datetime \| null` | Soft deletion timestamp            |

#### Events

- [ ] `order.filled` — Order filled
- [ ] `order.cancelled` — Order cancelled
- [ ] `order.reservation_expired` — Reservation expired

---

### Order Item

| Attribute  | Type               | Description                  |
| ---------- | ------------------ | ---------------------------- |
| id         | `uuid`             | Unique order item identifier |
| order_id   | `uuid`             | Associated order             |
| product_id | `uuid`             | Associated product           |
| quantity   | `number`           | Quantity ordered             |
| created_at | `datetime`         | Creation timestamp           |
| updated_at | `datetime`         | Last update timestamp        |
| deleted_at | `datetime \| null` | Soft deletion timestamp      |

---

### Employee

| Attribute  | Type               | Description                |
| ---------- | ------------------ | -------------------------- |
| id         | `uuid`             | Unique employee identifier |
| name       | `string`           | Employee name              |
| created_at | `datetime`         | Creation timestamp         |
| updated_at | `datetime`         | Last update timestamp      |
| deleted_at | `datetime \| null` | Soft deletion timestamp    |

#### API Endpoints

<!-- - [ ] `POST /employees` — Create a new employee -->

#### Events

- [ ] `users.employee.created` — New employee created
