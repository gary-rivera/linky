# Linky
## Prereqs
- make sure ports 3000, 5432, and 5555 are available

## Setup

1. Start app
```bash
docker-compose up --build
```
2. Start Prisma Studio (if you want to see database tables) 
```bash
docker-compose exec app npx prisma studio
``` 
3. Access app
- localhost:3000 -> application server
- localhost:5555 -> prisma studio (after running previous bash command

## Notes
- docker compose handles seeding some starter data 
- environement variables should auto populate but each layer has an .env file to help out configuring
