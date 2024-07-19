import { PrismaClient } from '@prisma/client';
import { withOptimize } from "@prisma/extension-optimize";

let _prisma;

export const usePrisma = () => {
    if (!_prisma) {
        _prisma = new PrismaClient().$extends(withOptimize());
    }
    return _prisma;
}
