FurniciCronJobs = {};
Meteor.startup(function(){
  if(Meteor.isServer) {
    Recurring.find().forEach(function(rec){
      addRecurring(rec);
    });
  }
});

addRecurring = function(rec) {
  FurniciCronJobs[rec._id] = new Cron(function() {
    doRecurring(rec);
  }, {
    minute: 0,
    hour: 4,
    day: rec.day
  });
};
doRecurring = function (rec) {
  var currentDate = moment();
  var transaction = {catId: rec.catId, tag: rec.tag, amount: rec.amount, date: currentDate.format("DD-MM-YYYY")};
  var budget = Budgets.findOne();
  budget.total += parseFloat(rec.amount);
  Budgets.update({_id: budget._id}, {$set: {total: budget.total}});
  Transactions.insert(transaction);
};