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
      var selector = {};
      if(this.queryParams.type && type!=="all") {
        selector.type = this.queryParams.type;
      }
      if(this.queryParams.lastMonths) {
          var compareDate = moment();
          compareDate.date(1);
          compareDate.hour(0);
          compareDate.minute(0);
          compareDate.second(0);
          compareDate.subtract(parseInt(this.queryParams.lastMonths), 'month');
          selector.date = {'$gte': compareDate.format("DD-MM-YYYY")};
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


  Api.addRoute('recurring/:id',{},{
    delete: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring id not set'}
        };
      }
      var recurring = Recurring.findOne(this.urlParams.id);
      if(!recurring) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring not found'}
        };
      }
      Recurring.remove({_id: this.urlParams.id});
      delete FurniciCronJobs[this.urlParams.id];
      return {
        statusCode: 200,
        body: {status: 'success', message: 'Recurring removed'}
      };
    },
    patch: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring id missing'}
        };
      }
      var recurring = Categories.findOne(this.urlParams.id);
      if(!recurring) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring not found'}
        };
      }
      Recurring.update({_id: this.urlParams.id}, {$set: this.bodyParams});
      var recurring =  Recurring.findOne(this.urlParams.id);
      delete FurniciCronJobs[recurring._id];
      addRecurring(recurring);
      return recurring;
    }
  });
  Api.addRoute('recurring', {}, {
    get: function () {
      var selector = {};
      if(this.queryParams.type && this.queryParams.type != "all") {
        selector.type = this.queryParams.type;
      }
      var recurring = Recurring.find(selector).fetch();
      if(recurring.length) {
        return recurring;
      } else {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring not found'}
        };
      }
    },
    put: function() {
      var id = Recurring.insert(this.bodyParams);
      var recurring = Recurring.findOne(id);
      addRecurring(recurring);
      return recurring;
    }
  });
}