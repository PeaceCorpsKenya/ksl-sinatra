$(function() {
  window.KSL = {
    model: {},
    view:  {}
  };

  // Models
  KSL.model.sign = Backbone.Model.extend({
    initialize: function() {
                },

    letter:     function() {
                  var name = this.get('name');
                  if(name) {
                    return name[0];
                  } else {
                    return undefined;
                  }
                }
  });

  KSL.model.signs = Backbone.Collection.extend({
    url:      "/signs",
    model:    KSL.sign,

    initialize: function() {
                  this.on('sync', this.setLocalStorage);
                  this.on('fetch', this.setLocalStorage);
                },

    setLocalStorage: function() {
                       localStorage.setItem('signs', this.toJSON());
                     },


    sync:       function (method, model, options) {
                  var localCopy = (window.localStorage && window.localStorage.getItem('signs'));

                  var networkAvailable;
                  try {
                    $.get("/");
                    networkAvailable = true;
                  } catch (error) {
                    networkAvailable = false;
                  }


                  // FIXME: Add additional sync behavior for update, delete, create
                  if((method === 'read') && localCopy) {
                    // TODO FIXME
                    console.error("to implement");
                  } else if(networkAvailable) {
                    Backbone.sync.call(method, model, options);
                  }
                }

  });

  // Views
  KSL.view.sign = Backbone.View.extend({
    template:  Handlebars.compile($("#sign-template").html()),

    render:    function() {
                 this.$el.html(this.template(this.model.attributes));
               }
  });

  KSL.view.signs = Backbone.View.extend({

    initialize: function() {
                  this.listenTo(this.collection, 'sync', this.render);
                },

    render:   function() {
                this.$el.html('');
                _.each(this.collection.models, function(sign) {
                  var $el = $("<div></div>");
                  var signView = new KSL.view.sign({
                    el: $el,
                    model: sign
                  })
                  signView.render();
                  this.$el.append(signView.$el);
                });
              }
  });

});

$(function() {

  // Run app
  window.app = {
  };

  app.signs = new KSL.model.signs();
  app.articles = new KSL.view.signs({
    collection: app.signs
  });

  app.signs.fetch(); // renders on sync
});
