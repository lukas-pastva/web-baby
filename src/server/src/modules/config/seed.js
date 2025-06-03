import { AppConfig } from "./model.js";

export async function syncConfig() {
  await AppConfig.sync({ alter:true });
  if (await AppConfig.count() === 0) {
    await AppConfig.create({
      id              : 1,
      theme           : "boy",
      mode            : "light",
      disabledTypes   : [],
      childName       : "",
      childSurname    : "",
      birthTs         : process.env.BIRTH_TS || null,
      birthWeightGrams: process.env.BIRTH_WEIGHT_GRAMS
        ? Number(process.env.BIRTH_WEIGHT_GRAMS)
        : null,
    });
  }
}
