module.exports = {
	"isValid": {
		"when model has not defined any validation": {
			beforeEach: function () {
				this.model = new Backbone.Model();

				_.extend(this.model, Backbone.Validation.mixin);
			},

			"returns true": function () {
				assert(this.model.isValid());
			}
		},

		"when model has defined validation": {
			beforeEach: function () {
				var Model = Backbone.Model.extend({
					validation: {
						name: {
							required: true
						}
					}
				});
				this.model = new Model();
				_.extend(this.model, Backbone.Validation.mixin);
			},

			"returns undefined when model is never validated": function () {
				refute.defined(this.model.isValid());
			},

			"returns true when model is valid": function () {
				this.model.set({ name: 'name' }, { validate: true });

				assert(this.model.isValid());
			},

			"returns false when model is invalid": function () {
				this.model.set({ name: '' }, { validate: true });

				refute(this.model.isValid());
			},

			"can force validation by passing true": function () {
				refute.defined(this.model.isValid());
				assert(this.model.isValid(true) === false);
			},

			"invalid is triggered when model is invalid": function (done) {
				this.model.on('invalid', function (model, attrs) {
					done();
				});
				refute(this.model.isValid(true));
			},

			"and passing name of attribute": {
				beforeEach: function () {
					this.model.validation = {
						name: {
							required: true
						},
						age: {
							required: true
						}
					};
				},

				"returns false when attribute is invalid": function () {
					refute(this.model.isValid('name'));
				},

				"invalid is triggered when attribute is invalid": function (done) {
					this.model.on('invalid', function (model, attrs) {
						done();
					});
					refute(this.model.isValid('name'));
				},

				"returns true when attribute is valid": function () {
					this.model.set({ name: 'name' });

					assert(this.model.isValid('name'));
				}
			},

			"and passing array of attributes": {
				beforeEach: function () {
					this.model.validation = {
						name: {
							required: true
						},
						age: {
							required: true
						},
						phone: {
							required: true
						}
					};
				},

				"returns false when all attributes are invalid": function () {
					refute(this.model.isValid(['name', 'age']));
				},

				"returns false when one attribute is invalid": function () {
					this.model.set({ name: 'name' });

					refute(this.model.isValid(['name', 'age']));
				},

				"returns true when all attributes are valid": function () {
					this.model.set({ name: 'name', age: 1 });

					assert(this.model.isValid(['name', 'age']));
				}
			}
		}
	}
}