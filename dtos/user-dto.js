module.exports = class UserDTO {
  id_account;
  login;

  constructor(model) {
    this.id_account = model.id_account;
    this.login = model.login;
  }
};
