# Niki

## API - Users 
### Models & UseCases
#### User
> Vou fazer esse service básico porque não é o foco do desafio

- name
- email
- password
- cpf
- roles
    - customer
    - employee

- customer address id (string | null)
- [ ] sign in
- [ ] sign up


#### Customer Address
- id
### Producer events
1. create customer
    1. consumer: notification
        1. id
        2. name
        3. email

    2. consumer: payments
        1. id
        2. name
        3. cpf
        4. address
            1. id


    3. consumer: orders
        1. id
        2. name
        3. address
            1. id


    4. consumer: delivery
        1. id
        2. name
        3. address
            1. id



2. create employee
    1. consumer: product invetory
        1. id

    2. consumer: delivery
        1. id
        2. name


## API - Product Inventory 
### Models & UseCases
#### Product
- name
- id
- price in cents
- image url
- available item count
- unavailable item count
- created by employee
- [ ] create product
- [ ] upload product image
- [ ] reserve products
- [ ] unreserve products
#### Employee
- id
### Producer events
1. create product
    1. consumer: elastic search - create item in index product
        1. id
        2. image url
        3. available item count
        4. name
        5. price

    2. consumer: orders
        1. id
        2. name
        3. image url
        4. price


2. upload product image
    1. consumer: elastic search - update item in index product 
        1. id
        2. image url

    2. consumer: orders
        1. id
        2. image url


3. reserve product
    1. update item in index product in elastic search
        1. id
        2. available item count


4. unreserve product
    1. update item in index product in elastic search
        1. id
        2. available item count




## API - Product Catalog
### Models & UseCases
#### Product
- name
- id
- price in cents
- image url
- available item count
- [ ] Search products with filters


## API - Orders
### Models & UseCases
> Quando eu criar uma order, fazer o mobile requisitar a rota /orders/id-da-order/payment

#### Order
- id
- customer id
- product ids
- status
    - created
    - inventory products missing
    - inventory confirmed
    - awaiting payment
    - payment succeeded
    - payment failed
    - shipment created
    - delivery failed
    - delivery completed

- total amount
- payment method
    - pix

- delivery address id


- [ ] create order
    - [ ] enviar evento order filled
    - [ ] o product inventory vai verificar esses produtos
    - [ ] se tiver esses produtos vai enviar dois eventos
    - [ ] products disponiveis em estoque
        - [ ] order server vai mudar o status para created e vai disparar o evento de ordem criada
        - [ ] 

    - [ ] produtos reserve
    - [ ] 

- [ ] list all orders


#### Product
- id
- name
- image url
- price


#### Customer
- id
- name


#### Customer Address
- id


## API - Payments
### Models & UseCases
#### Payment
- id
- order id
- status 
    - pending
    - expired
    - cancelled
    - paid
    - refunded

- amount
- payment gateway
- [ ] create payment
- [ ] get payment by order id


#### Customer
- id


#### Order
- id
- customer id


## API - Delivery
### Models & UseCases
#### Shipments
- id
- order id
- status
    - shipment created
    - delivery failed
    - delivery completed

- delivener employee id


#### Order
- id


#### Employee
- id


## API - Notifications
### Models & UseCases
#### Emails Submitted
- id
- type
    - order created
    - inventory products missing
    - awaiting payment
    - payment succeeded
    - payment failed
    - delivery failed
    - delivery completed

#### Customer
- id
- email
- name


