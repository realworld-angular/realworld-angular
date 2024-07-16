import { PrismaClient } from '@prisma/client'

let _prisma: PrismaClient

export const usePrisma = () => {
    if (!_prisma) {
        _prisma = new PrismaClient()
    }
    return _prisma
}
