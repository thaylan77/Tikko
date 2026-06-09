import faker from "faker";
import AppError from "../../../errors/AppError";
import CreateTicketService from "../../../services/TicketServices/CreateTicketService";
import CreateContactService from "../../../services/ContactServices/CreateContactService";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import Whatsapp from "../../../models/Whatsapp";
import { disconnect, truncate } from "../../utils/database";

const makeNumber = (): string =>
  Math.floor(Math.random() * 1e11)
    .toString()
    .padStart(11, "0");

const seedDefaultWhatsapp = async (): Promise<Whatsapp> =>
  Whatsapp.create({
    name: faker.company.companyName(),
    status: "CONNECTED",
    isDefault: true
  });

describe("Ticket", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should not be able to create a ticket without a default whatsapp", async () => {
    const contact = await CreateContactService({
      name: faker.name.findName(),
      number: makeNumber()
    });
    const user = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });

    await expect(
      CreateTicketService({
        contactId: contact.id,
        status: "open",
        userId: user.id
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to create a new ticket", async () => {
    await seedDefaultWhatsapp();
    const contact = await CreateContactService({
      name: faker.name.findName(),
      number: makeNumber()
    });
    const user = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });

    const ticket = await CreateTicketService({
      contactId: contact.id,
      status: "open",
      userId: user.id
    });

    expect(ticket).toHaveProperty("id");
    expect(ticket.contactId).toBe(contact.id);
  });

  it("should not be able to create a ticket when the contact already has an open one", async () => {
    await seedDefaultWhatsapp();
    const contact = await CreateContactService({
      name: faker.name.findName(),
      number: makeNumber()
    });
    const user = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });

    await CreateTicketService({
      contactId: contact.id,
      status: "open",
      userId: user.id
    });

    await expect(
      CreateTicketService({
        contactId: contact.id,
        status: "open",
        userId: user.id
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
