npx prisma generate
npx prisma db push
npx prisma migrate dev --name init

psql -U your_username -d your_database_name