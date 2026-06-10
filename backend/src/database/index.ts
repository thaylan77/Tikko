import { Sequelize } from "sequelize-typescript";
import { getTenantId } from "../context/tenantContext";
import Company from "../models/Company";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import WppKey from "../models/WppKey";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  Company,
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  WppKey
];

sequelize.addModels(models);

// Isolação multi-tenant automática: para todo model que tem `companyId`, filtra
// as buscas e preenche o companyId na criação, a partir do contexto da requisição.
// Sem contexto (jobs/webhooks/seeds) os hooks são no-op.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
models.forEach((model: any) => {
  if (!model.rawAttributes || !("companyId" in model.rawAttributes)) {
    return;
  }

  model.addHook("beforeFind", (options: any) => {
    const companyId = getTenantId();
    if (!companyId) return;
    options.where = { companyId, ...(options.where || {}) };
  });

  model.addHook("beforeCreate", (instance: any) => {
    const companyId = getTenantId();
    if (companyId && instance.companyId == null) {
      instance.companyId = companyId;
    }
  });
});

export default sequelize;
