import faker from "faker";
import AppError from "../../../errors/AppError";
import CreateContactService from "../../../services/ContactServices/CreateContactService";
import ShowContactService from "../../../services/ContactServices/ShowContactService";
import DeleteContactService from "../../../services/ContactServices/DeleteContactService";
import { disconnect, truncate } from "../../utils/database";

const makeNumber = (): string =>
  Math.floor(Math.random() * 1e11)
    .toString()
    .padStart(11, "0");

describe("Contact", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should be able to create a new contact", async () => {
    const contact = await CreateContactService({
      name: faker.name.findName(),
      number: makeNumber()
    });

    expect(contact).toHaveProperty("id");
  });

  it("should not be able to create a contact with a duplicated number", async () => {
    const number = makeNumber();

    await CreateContactService({ name: faker.name.findName(), number });

    await expect(
      CreateContactService({ name: faker.name.findName(), number })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to show an existing contact", async () => {
    const created = await CreateContactService({
      name: faker.name.findName(),
      number: makeNumber()
    });

    const contact = await ShowContactService(created.id);

    expect(contact.id).toBe(created.id);
  });

  it("should not be able to show a non-existing contact", async () => {
    await expect(ShowContactService(999999)).rejects.toHaveProperty(
      "statusCode",
      404
    );
  });

  it("should be able to delete an existing contact", async () => {
    const created = await CreateContactService({
      name: faker.name.findName(),
      number: makeNumber()
    });

    await DeleteContactService(created.id.toString());

    await expect(ShowContactService(created.id)).rejects.toBeInstanceOf(
      AppError
    );
  });

  it("should not be able to delete a non-existing contact", async () => {
    await expect(DeleteContactService("999999")).rejects.toHaveProperty(
      "statusCode",
      404
    );
  });
});
