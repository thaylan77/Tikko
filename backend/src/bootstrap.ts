import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});

// Fail-fast: variáveis sensíveis não podem cair em um valor padrão.
// Sem isso, o app assinaria JWTs com um segredo público conhecido.
const requiredEnv = ["JWT_SECRET", "JWT_REFRESH_SECRET"];

const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(
    `Variáveis de ambiente obrigatórias ausentes: ${missingEnv.join(", ")}. ` +
      `Defina-as no arquivo .env (gere um valor seguro com: openssl rand -base64 32).`
  );
}
