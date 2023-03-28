module.exports = class UserDTO {
  id_account;
  id_user;
  login;
  role;

  constructor(model) {
    this.id_account = model.id_account;
    this.id_user = model.id_user;
    this.login = model.login;
    this.role = model.name;
  }
};
