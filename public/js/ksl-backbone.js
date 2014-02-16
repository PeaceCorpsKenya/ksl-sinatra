$(function() {
  window.KSL = {
    model: {},
    view:  {}
  };

  Backbone.sync = function Sync() {
    Backbone.ajaxSync.apply(this, arguments);
    return Backbone.localSync.apply(this, arguments);
  };

  // Models
  var sign = Backbone.Model.extend({
    initialize: function() {
                },

    localStorage: new Backbone.LocalStorage("sign"),

    letter:     function() {
                  var name = this.get('name');
                  if(name) {
                    return name[0];
                  } else {
                    return undefined;
                  }
                }
  });
  KSL.model.sign = sign;

  var signs = Backbone.Collection.extend({
    model:    sign,
    url:      "/signs.json",

    collection: {localStorage: new Backbone.LocalStorage("signs")},

    bootstrap: function() {
                 var signs = this;
                 signs.fetch();

                 $.get(this.url, function(attr) {
                   var models = _.map(attr, function(a) {
                     return new sign(a);
                   });
                   signs.set(models);
                   signs.create();
                   signs.trigger('set', signs.models)
                 });
               }
  });
  KSL.model.signs = signs;

  // Views
  KSL.view.article = Backbone.View.extend({
    template:  Handlebars.compile($("#sign-template").html()),

    render:    function() {
                 this.$el.html(this.template(this.model.attributes));
               }
  });

  KSL.view.articles = Backbone.View.extend({
    initialize: function() {
                  this.listenTo(this.collection, 'set', this.render);
                },

    render:   function() {
                this.$el.html('');
                var articles = this;
                _.each(this.collection.models, function(sign) {
                  var $el = $("<div></div>");
                  var article = new KSL.view.article({
                    el: $el,
                    model: sign
                  })
                  article.render();
                  articles.$el.append(article.$el);
                });
              }
  });

  KSL.view.categoryTag = Backbone.View.extend({
    template:    Handlebars.compile($("#category-tag").html()),

    render:     function() {
                  this.$el.html(this.template(this.model));
                }
  });

  KSL.view.categoryTags = Backbone.View.extend({

    events:  {
      'click .browse-category': 'browseCategory'
    },

    initialize: function() {
                  this.listenTo(this.collection, 'set', this.render);
                },

    render:    function() {
                  this.categories = _.flatten(_.map(this.collection.models, function(model) {
                    return model.get('categories');
                  }));
                  var obj = this;
                  this.$el.html('');
                  _.each(this.categories, function(category) {
                    var categoryTag = new KSL.view.categoryTag({
                      model: category
                    });
                    categoryTag.render();
                    obj.$el.append(categoryTag.$el);
                  });
                },

    browseCategory: function(evt) {
                      evt.preventDefault();
                      this.trigger('browse:category', $(evt.currentTarget).data('name'));
                    }
  });


  KSL.workspace = Backbone.Router.extend({
    routes: {
      "help":                 "help",      // #help
      "category/:name":      "category"    // all in a category
    },

    category: function(name) {
      Backbone.history.navigate("/category"+name);

      var signs = new KSL.model.signs(_.select(app.signs.models, function(s) {
        return _.contains(_.map(s.get('categories'), function(m) { return m.name; }), name);
      }));

      var articles = new KSL.view.articles({
        collection: signs,
        el: $("#articles")
      });

      articles.render();
    }
  });
});




$(function() {
  // Run app
  window.app = {
  };

  app.signs = new KSL.model.signs({});

  app.articles = new KSL.view.articles({
    collection: app.signs,
    el: $("#articles")
  });
  app.articles.render();

  app.categoryTags = new KSL.view.categoryTags({
    el: $("#category-tags"),
    collection: app.signs
  });

  app.signs.bootstrap();

  app.workspace = new KSL.workspace();
  Backbone.history.start({pushState: true})
  app.workspace.listenTo(app.categoryTags, 'browse:category', app.workspace.category);

});
