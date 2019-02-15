
Meteor.methods({
	adminGetMethods: function() {
	
		if(!K.Admin.isMe()) return false;

		console.log('Admin: adminGetMethods');

		return _.keys(K.Admin.method);
	},
	adminsEmail: function(subject, body) {

		Users.find({isAdmin: 1}).forEach(function (userAdmin) {
			if(userAdmin.emails && userAdmin.emails[0] && userAdmin.emails[0].address) {
				Email.send({
					from: K.settings.accounts.emailTemplates.from,
					to: userAdmin.emails[0].address,
					subject: subject || '',
					html: body || ''
				});	
			}
		});
	}
});


/*Accounts.onLogin(function(login) {

	if(login.user && login.user._id && K.Admin.isMe(login.user)) {

		console.log('Admin: update adminUsers...', K.settings.admin.adminUsers);

		Users.update(login.user._id, {
			$set: {
				isAdmin: 1
			}
		});
	}
});
*/
Meteor.startup(function() {
	if(K.settings.admin.adminUsers.length) {

		var on = Users.update({
			username: {$in: K.settings.admin.adminUsers}
		}, {
			$set: {
				isAdmin: 1
			}
		},{ multi: true });

		var of = Users.update({
			username: {$nin: K.settings.admin.adminUsers}
		}, {
			$set: {
				isAdmin: 0
			}
		},{ multi: true });

		console.log('Admin: update adminUsers...', K.settings.admin.adminUsers);

		//TODO	
		/*if(!Users.findOne({username: 'admin'})) {
			console.log('Admin: autocreate admin account user: admin pass: adminadmin ');
		}*/
	}
	if(K.settings.admin.emailOnStartup) {
		Meteor.call('adminsEmail','Kepler Startup!');
	}
});

/*
RESET admin password, uncomment for use

Meteor.methods({
	setpass: function(pass) {
		console.log('setpass',pass)
		var userData = Users.findOne({username: 'admin' });
		Accounts.setPassword(userData._id, pass);
	}
});*/