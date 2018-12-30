module.exports = {
    "method validator": {
        beforeEach: function () {
            var that = this;
            var Model = Backbone.Model.extend({
                validation: {
                    name: {
                        fn: function (val, attr, computed) {
                            that.ctx = this;
                            that.attr = attr;
                            that.computed = computed;
                            if (name !== 'backbone') {
                                return 'Error';
                            }
                        }
                    }
                }
            });
            this.model = new Model();
            _.extend(this.model, Backbone.Validation.mixin);
        },

        "is invalid when method returns error message": function () {
            refute(this.model.set({
                name: ''
            }, { validate: true }));
        },

        "is valid when method returns undefined": function () {
            refute(this.model.set({
                name: 'backbone'
            }, { validate: true }));
        },

        "context is the model": function () {
            this.model.set({
                name: ''
            }, { validate: true });
            assert.same(this.ctx, this.model);
        },

        "second argument is the name of the attribute being validated": function () {
            this.model.set({ name: '' }, { validate: true });
            assert.equals('name', this.attr);
        },

        "third argument is a computed model state": function () {
            this.model.set({ attr: 'attr' });
            this.model.set({
                name: 'name',
                age: 1
            }, { validate: true });

            assert.equals({ attr: 'attr', name: 'name', age: 1 }, this.computed);
        }
    }
}

module.exports = {
    "method validator short hand syntax": {
        beforeEach: function () {
            var that = this;
            var Model = Backbone.Model.extend({
                validation: {
                    name: function (val, attr, computed) {
                        that.ctx = this;
                        that.attr = attr;
                        that.computed = computed;
                        if (name !== 'backbone') {
                            return 'Error';
                        }
                    }
                }
            });
            this.model = new Model();
            _.extend(this.model, Backbone.Validation.mixin);
        },

        "is invalid when method returns error message": function () {
            refute(this.model.set({
                name: ''
            }, { validate: true }));
        },

        "is valid when method returns undefined": function () {
            refute(this.model.set({
                name: 'backbone'
            }, { validate: true }));
        },

        "context is the model": function () {
            this.model.set({
                name: ''
            }, { validate: true });
            assert.same(this.ctx, this.model);
        },

        "second argument is the name of the attribute being validated": function () {
            this.model.set({ name: '' }, { validate: true });
            assert.equals('name', this.attr);
        },

        "third argument is a computed model state": function () {
            this.model.set({ attr: 'attr' });
            this.model.set({
                name: 'name',
                age: 1
            }, { validate: true });

            assert.equals({ attr: 'attr', name: 'name', age: 1 }, this.computed);
        }
    }
}

module.exports = {
    "method validator using other built in validator(s)": {
        beforeEach: function () {
            var Model = Backbone.Model.extend({
                validation: {
                    name: function (val, attr, computed) {
                        return Backbone.Validation.validators.length(val, attr, 4, this);
                    }
                }
            });

            _.extend(Model.prototype, Backbone.Validation.mixin);
            this.model = new Model();
        },

        "it should format the error message returned from the built in validator": function () {
            assert.equals('Name must be 4 characters', this.model.preValidate('name', ''));
        }
    }
}