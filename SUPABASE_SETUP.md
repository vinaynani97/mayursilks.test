Supabase setup for Mayur Silks (Prisma + NextAuth)

1. Create a Supabase project

- Go to https://app.supabase.com and sign up (free tier).
- Create a new project. Note the Database connection string (Postgres). Under "Settings > Database" you can find the connection string.

2. Obtain the connection string (Prisma-compatible)

- Supabase provides a connection string similar to:
  postgres://postgres:<DB_PASSWORD>@<DB_HOST>:5432/postgres
- Convert to a Prisma-compatible `DATABASE_URL` and set SSL and schema if needed. Example (recommended):

DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@db.<project>.supabase.co:5432/postgres?schema=public&sslmode=require"

Replace `YOUR_DB_PASSWORD` and host with your Supabase values. Put this in `.env.local` at the project root.

3. Verify environment variables

- Create `.env.local` with at least:
  DATABASE_URL="postgresql://postgres:password@db.host.supabase.co:5432/postgres?schema=public&sslmode=require"
  NEXTAUTH_URL="http://localhost:3000"
  NEXTAUTH_SECRET="<a long, random secret, min 32 chars>"
  AUTH_SECRET="<same as NEXTAUTH_SECRET>"

4. Prisma + DB steps (run locally in project root)

- Generate Prisma client:
  npm run db:generate

- Push schema (non-destructive):
  npm run db:push

  or use migrations:
  npm run db:migrate

5. Seed the admin user

- Run the seed script to create the default admin:
  npm run db:seed

- Expected output: "✅ Admin user created: admin@mayursilks.com / Admin@123"

6. Validate admin exists and password is hashed

- Use psql or a quick Node one-liner (requires Node):
  node -e "require('dotenv').config({path:'.env.local'}); const {PrismaClient}=require('@prisma/client'); const bcrypt=require('bcryptjs'); (async()=>{const p=new PrismaClient(); const u=await p.user.findUnique({where:{email:'admin@mayursilks.com'}}); console.log(u?{email:u.email,role:u.role,password:u.password?.slice(0,30)+'...'}:null); if(u) console.log('bcrypt compare', await bcrypt.compare('Admin@123', u.password)); await p.$disconnect();})();"

7. Start Next dev
   npm run dev

- Visit: http://localhost:3000/admin/login
- Sign in with: admin@mayursilks.com / Admin@123

8. Post-check cleanup

- We removed debug logs from `src/lib/auth.ts`. No further code changes are required for Supabase. If you want, rotate the `NEXTAUTH_SECRET` after setup.

If you share your Supabase `DATABASE_URL` (do not share secrets publicly), I can run `prisma generate`, `prisma db push`, and seed from this environment, or provide exact commands you can run locally.
