Router.route('/', function () {
	this.render(Meteor.user() ? 'layout_app' : 'layout_home');
});
