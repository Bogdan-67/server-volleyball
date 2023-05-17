module.exports = class SelectUsersDTO {
  id_account;
  name;
  surname;
  patronimyc;
  email;
  phone;

  constructor(model) {
    this.id_account = model.id_account;
    this.name = model.name;
    this.surname = model.surname;
    this.patronimyc = model.patronimyc;
    this.email = model.email;
    this.phone = model.phone;
  }
};
