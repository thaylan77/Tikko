import { SignOptions } from "jsonwebtoken";

// Os segredos são validados em src/bootstrap.ts (fail-fast).
// Não usar valores padrão aqui: um fallback conhecido permitiria forjar tokens.
export default {
  secret: process.env.JWT_SECRET as string,
  expiresIn: "15m" as SignOptions["expiresIn"],
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  refreshExpiresIn: "7d" as SignOptions["expiresIn"]
};
