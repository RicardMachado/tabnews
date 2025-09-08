import { NotFoundError, UnauthorizedError } from "infra/errors.js";
import password from "./password.js";
import user from "./user.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storeUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storeUser.password);

    return storeUser;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados enviados estão corretos.",
      });
    }

    throw err;
  }

  async function findUserByEmail(providedEmail) {
    let storeUser;

    try {
      storeUser = await user.findOneByEmail(providedEmail);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se este dado está correto.",
        });
      }

      throw err;
    }

    return storeUser;
  }

  async function validatePassword(providedPassword, storePassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storePassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = { getAuthenticatedUser };

export default authentication;
