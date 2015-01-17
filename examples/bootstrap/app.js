var User = Backbone.Model.extend(
  {
    validation: {
      name: {
        required: true
      },
      password: {
        required: true
      },
      birthdate: {
        required: true
      }
    }
  }
);

var LoginView = Backbone.View.extend(
  {
    el: '#login-form',
    initialize: function () {
      Backbone.Validation.bind(this, {
        attributes: ['name', 'password']
      });
    },
    render: function () {
      return this;
    },
    check: function () {
      console.log('login isvalid', this.model.isValid());
    }
  }
);


var user = new User({name: 'Luiz', password: 'xxx'});
var login = new LoginView(
  {
    model: user
  }
);

$(function () {
  login.render();
  login.check();
})
