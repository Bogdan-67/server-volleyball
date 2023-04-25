module.exports = class UserDTO {
  name;
  surname;
  patronimyc;

  constructor(model) {
    this.name = model.name;
    this.surname = model.surname;
    this.patronimyc = model.patronimyc;
  }
};
