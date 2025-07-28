# Linky
## Prereqs
- make sure ports 3000, 5432, and 5555 are available

## Setup

1. Start app
```bash
docker-compose up --build
```
2. Seed database 
```bash
docker-compose exec app npx prisma db seed
``` 
3. Access app
- localhost:3000 -> application server
- localhost:5555 -> prisma studio (view database tables)

## Notes
- environement variables should auto populate but each layer has an .env file to help out configuring
