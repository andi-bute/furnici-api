if (Meteor.isServer) {

  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  //Api.addRoute('budget', {authRequired: true}, {
  Api.addRoute('budget', {}, {
    get: function () {
      var budget = Budgets.findOne();
      if(!budget) {
        Budgets.insert({total: 0});
      }
      return Budgets.findOne();
    },
    patch: function() {
      Budgets.update({}, {$set: this.bodyParams});
      return Budgets.findOne();
    }
  });
  Api.addRoute('categories', {}, {
    get: function () {
      var categories = Categories.find().fetch();
      if(!categories.length) {
        Categories.insert({"name": "Food", type: "expense", "limit": 300});
      }
      return Categories.find().fetch();
    },
    put: function() {
      var id = Categories.insert(this.bodyParams);
      return Categories.findOne(id);
    },
    patch: function() {
      if(this.queryParams.id) {
        var category = Categories.findOne(this.queryParams.id);
        if(!category) {
          return {
            statusCode: 404,
            body: {status: 'fail', message: 'Category not found'}
          };
        }
        Categories.update({_id: this.queryParams.id}, {$set: this.bodyParams});
        return Categories.findOne(this.queryParams.id);
      } else {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category id missing'}
        };
      }
    }
  });
}