# Mehr-E-Commerce-Backend

MEHR API: Express + TypeScript + MongoDB, with S3 media and Nodemailer.

Pairs with the storefront at [Mehr-E-Commerce-frontend](https://github.com/sohail-brohi/Mehr-E-Commerce-frontend).

## Develop

```sh
npm i
copy .env.example .env
npm run dev
```

- API: http://localhost:4000
- Health: http://localhost:4000/api/health

Studio access is granted automatically when `sohailbrohi048@gmail.com` registers.

Order confirmation emails send when SMTP is configured in `.env`.

```sh
npm run seed
```

## Stack

- Node.js, Express, TypeScript
- MongoDB (Mongoose)
- S3-compatible object storage
- JWT auth
- Nodemailer
