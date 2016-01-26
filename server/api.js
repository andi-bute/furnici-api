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
  Api.addRoute('categories/:id',{},{
    delete: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var category = Categories.findOne(this.urlParams.id);
      if(!category) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not found'}
        };
      }
      Categories.remove({_id: this.urlParams.id});
      return {
        statusCode: 200,
        body: {status: 'success', message: 'Category removed'}
      };
    },
    patch: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category id missing'}
        };
      }
      var category = Categories.findOne(this.urlParams.id);
      if(!category) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not found'}
        };
      }
      Categories.update({_id: this.urlParams.id}, {$set: this.bodyParams});
      return Categories.findOne(this.urlParams.id);
    }
  });
  Api.addRoute('categories', {}, {
    get: function () {
      console.log(this.queryParams);
      var selector = {};
      if(this.queryParams.type) {
        selector.type = this.queryParams.type;
      }
      if(this.queryParams.limit) {
        selector.limit = {'$exists': 1};
      }
      var categories = Categories.find(selector).fetch();
      if(categories.length) {
        return categories;
      } else {
        Categories.insert({"name": "Food", type: "expense", "limit": 300});
      }
      return Categories.find(selector).fetch();
    },
    put: function() {
      var id = Categories.insert(this.bodyParams);
      return Categories.findOne(id);
    }
  });

  Api.addRoute('transactions', {}, {
    get: function() {
      console.log(this.queryParams);
      var selector = {};
      if(this.queryParams.type && type!=="all") {
        selector.type = this.queryParams.type;
      }
      if(this.queryParams.lastMonths) {
          var compareDate = moment();
          compareDate.dates(1);
          compareDate.subtract(parseInt(this.queryParams.lastMonths), 'month');
          selector.date = {'$gte': compareDate.toString()};
      }
      if(this.queryParams.byCategory) {
        selector.catId = this.queryParams.byCategory;
      }
      var limiter = {};
      if(this.queryParams.page) {
        limiter.skip = this.queryParams.page;
      }
      if(this.queryParams.limitPerPage) {
        limiter.limit = this.queryParams.limitPerPage;
      }
      if(this.queryParams.sortBy) {
        limiter.sort = {};
        limiter.sort[this.queryParams.sortBy] = 1;
      }
      return Transactions.find(selector, limiter).fetch();
    },
    put: function() {
      var id = Transactions.insert(this.bodyParams);
      return Transactions.findOne(id);
    }
  });
  Api.addRoute('transactions/:id', {}, {
    get: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var transaction = Transactions.findOne(this.urlParams.id);
      if(!transaction) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Transaction not found'}
        };
      }
      return transaction;
    },
    patch: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var transaction = Transactions.findOne(this.urlParams.id);
      if(!transaction) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Transaction not found'}
        };
      }
      Transactions.update({_id: transaction._id}, {$set: this.bodyParams});
      return Transactions.findOne(transaction._id);
    },
    delete: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var transaction = Transactions.findOne(this.urlParams.id);
      if(!transaction) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Transaction not found'}
        };
      }
      Transactions.remove({_id: this.urlParams.id});
      return {
        statusCode: 200,
        body: {status: 'success', message: 'Transaction removed'}
      };
    }
  });
}