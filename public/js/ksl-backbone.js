$(function() {
  // Run app
  window.app = {};
  window.online = (new RegExp('http')).test(window.location.protocol);

  Backbone.sync = function Sync() {
    if(window.online) {
      return Backbone.ajaxSync.apply(this, arguments);
    } else {
      return Backbone.localSync.apply(this, arguments);
    }
  };
});


$(function() {
  window.KSL = {
    model: {},
    view:  {}
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

    search:    function(query) {
      if(query) {
        var re = new RegExp("^" + query);
        var signs = _.select(this.models, function(sign) {
          return (re.test(sign.get('name'))) || (_.any(sign.get('categories'), function(category) {
            return re.test(category.name);
          }));
        });
        // deep copy
        var signs = _.map(signs, function(sign) {
          return (sign.attributes);
        });
        return signs;
      } else {
        return [];
      }
    },

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

  KSL.view.minimalarticle = Backbone.View.extend({
    template:  Handlebars.compile($("#sign-minimal-template").html()),

    render:    function() {
                 this.$el.html(this.template(this.model.attributes));
               }
  });


  KSL.view.minimalarticles = Backbone.View.extend({
    initialize: function() {
                },

    render:   function() {
                this.$el.html('');
                var articles = this;
                _.each(this.collection.models, function(sign) {
                  var $el = $("<div></div>");
                  var article = new KSL.view.minimalarticle({
                    el: $el,
                    model: sign
                  });
                  article.render();
                  articles.$el.append(article.$el);
                });
              }
  });

  KSL.view.articles = Backbone.View.extend({
    initialize: function() {
                },

    render:   function() {
                this.$el.html('');
                var articles = this;
                _.each(this.collection.models, function(sign) {
                  sign.set("videourl", sign.get("url"))
                  var $el = $("<div></div>");
                  var article = new KSL.view.article({
                    el: $el,
                    model: sign
                  });
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

  KSL.view.search = Backbone.View.extend({
    events:     {
      'keyup [name="search"]': 'search'
    },

    template:   Handlebars.compile($("#search-template").html()),

    search:     function(evt) {
                  evt.preventDefault();
                  this.query = this.$el.find("[name='search']").val();
                  if(window.online) {
                    Backbone.history.navigate("a/search/"+this.query);
                  }
                  var signs = new KSL.model.signs();
                  signs.add(this.collection.search(this.query));
                  var articles = new KSL.view.articles({
                    collection: signs,
                    el: $("#articles")
                  });
                  articles.render();
                },

    render:     function() {
                  this.$el.html(this.template({
                    query: this.query
                  }));
                }
  });

  KSL.workspace = Backbone.Router.extend({
    routes: {
      "a/open/:name":          "open",
      "a/category/:name":      "category",    // all in a category
      "a/search/:name":        "search"
    },

    open: function(name) {
      if(window.online) {
        Backbone.history.navigate("a//sign/"+name);
      }
      var signs = new KSL.model.signs(_.detect(app.signs.models, function(s) {
        return s.get('name') == name;
      }));

      var articles = new KSL.view.articles({
        collection: signs,
        el: $("#articles")
      });

      articles.render();
    },

    category: function(name) {
      if(window.online) {
      Backbone.history.navigate("a/category/"+name);
      }

      var signs = new KSL.model.signs(_.select(app.signs.models, function(s) {
        return _.contains(_.map(s.get('categories'), function(m) { return m.name; }), name);
      }));

      var articles = new KSL.view.articles({
        collection: signs,
        el: $("#articles")
      });

      articles.render();
    },

    search: function(name) {
      $("#search-bar input[name='search']").val(name);
      $("#search-bar input[type='submit']").click();
    }
  });
});

$(function() {
  app.signs = new KSL.model.signs({});

  app.articles = new KSL.view.minimalarticles({
    collection: app.signs,
    el: $("#articles")
  });
  app.articles.render();
  app.articles.listenToOnce(app.articles.collection, 'set', app.articles.render);

  app.categoryTags = new KSL.view.categoryTags({
    el: $("#category-tags"),
    collection: app.signs
  });

  app.signs.bootstrap();

  app.search = new KSL.view.search({
    collection: app.signs,
    el: $("<div></div>")
  });
  app.search.render();
  $("#search-bar").append(app.search.$el);

  if(window.online) {
    app.workspace = new KSL.workspace();
    Backbone.history.start({pushState: true})
    app.workspace.listenTo(app.categoryTags, 'browse:category', app.workspace.category);
  }

});
