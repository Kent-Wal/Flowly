import pkg from "@prisma/client";
import pgPkg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;
const { Pool } = pgPkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("`DATABASE_URL` environment variable is required for Prisma");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
