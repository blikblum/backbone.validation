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
    events: {
      'click #enter': 'enterClick'
    },
    initialize: function () {
      Backbone.Validation.bind(this, {
        attributes: 'form'
      });
    },
    enterClick: function (e) {
      var isValid;
      e.preventDefault();
      this.model.set('name', this.$('[name="name"]').val());
      this.model.set('password', this.$('[name="password"]').val());
      this.model.set('repeatPassword', this.$('[name="repeatPassword"]').val());
      isValid = !!(this.model.isValid());
      if (isValid) {
        this.$('.alert')
          .removeClass('hidden alert-danger')
          .addClass('alert-success')
          .find('.alert-content')
          .html('All right!');
      } else {
        this.$('.alert')
          .removeClass('hidden alert-success')
          .addClass('alert-danger')
          .find('.alert-content')
          .html('An error occurred!');
      }
      console.log('Model is valid', isValid);
    }
  }
);

var UserDetailsView = Backbone.View.extend(
  {
    el: '#userdetails-form',
    events: {
      'click #save': 'saveClick'
    },
    initialize: function () {
      Backbone.Validation.bind(this, {
        attributes: function () {
          return ['name', 'password', 'birthdate']
        }
      });
    },
    saveClick: function (e) {
      var isValid;
      var address = {};
      e.preventDefault();
      this.model.set('name', this.$('[name="name"]').val());
      this.model.set('password', this.$('[name="password"]').val());
      this.model.set('birthdate', this.$('[name="birthdate"]').val());
      this.model.set('gender', this.$('[name="gender"]:checked').val());
      this.model.set('email', this.$('[name="email"]').val());
      address.street = this.$('[name="address.street"]').val();
      address.zip = this.$('[name="address.zip"]').val();
      this.model.set('address', address);

      isValid = !!(this.model.isValid());
      if (isValid) {
        this.$('.alert')
          .removeClass('hidden alert-danger')
          .addClass('alert-success')
          .find('.alert-content')
          .html('All right!');
      } else {
        this.$('.alert')
          .removeClass('hidden alert-success')
          .addClass('alert-danger')
          .find('.alert-content')
          .html('An error occurred!');
      }
      console.log('Model is valid', isValid);
    }
  }
);


var loginUser = new User({});
var user = new User({});
var loginView = new LoginView(
  {
    model: loginUser
  }
);

var userDetailsView = new UserDetailsView(
  {
    model: user
  }
);

$(function () {

})