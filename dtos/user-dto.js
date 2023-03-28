module.exports = class UserDTO {
  id_account;
  login;
  role;

  constructor(model) {
    this.id_account = model.id_account;
    this.login = model.login;
    this.role = model.name;
  }
};
