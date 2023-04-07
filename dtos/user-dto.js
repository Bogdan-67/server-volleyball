module.exports = class UserDTO {
  id_account;
  id_user;
  fio;
  email;
  phone;
  group;
  login;
  role;

  constructor(model) {
    this.id_account = model.id_account;
    this.id_user = model.id_user;
    this.fio = model.fio;
    this.email = model.email;
    this.phone = model.phone;
    this.group = model.group;
    this.login = model.login;
    this.role = model.name;
  }
};
