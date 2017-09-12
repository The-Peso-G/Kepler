
//TODO use https://github.com/DerMambo/ms-seo
Router.configure({
	loadingTemplate: 'panelLoading',
	notFoundTemplate: 'page404',
	//https://github.com/reywood/meteor-iron-router-ga
	trackPageView: true
});

Router.waitOn(function() {

	var routeName = this.route.getName();

	if(!K.settings.router.publicRoutes[routeName]) {
		
		if(!Meteor.user()) {
			if(Meteor.loggingIn())
				this.render(this.loadingTemplate);
			else
				Router.go('home');
		}
		else {
			return Meteor.subscribe('currentUser', function() {

				K.Profile.init(function(data) {
					
					i18n.setLanguage(data.lang);

					//TODO move to plugin admin
					if(K.Admin && K.Admin.isMe()){
						K.Admin.loadMethods();
					}
				});
			});
		}
	}
});

Router.onAfterAction(function() {

	var routeName = this.route.getName();

	document.title =  i18n('title_'+routeName) || _.str.capitalize(routeName);

	if(this.ready() && K.Profile.ready) {

		if(this.route.options.layoutTemplate==='layoutMap') {
			/*
			Template.layoutMap.onRendered(function() {
				K.Map.init($('#map')[0], K.Profile.getOpts('map'));
			});
			Template.layoutMap.onDestroyed(function() {
				K.Map.destroy();
			});
			*/
			//PATCH render map after template layoutMap is rendered
			//Template.layoutMap.onRendered(function() {

			Meteor.setTimeout(function() {
				
				K.Map.init($('#map')[0], K.Profile.getOpts('map'));

			},10);
		
		}
		else 
			K.Map.destroy();
	}
});

Router.map(function() {

	this.route('home', {
		path: '/home',
		layoutTemplate: 'layoutFull',
		loadingTemplate: 'pageLoading',
	});

	this.route('logout', {
		path: '/logout',
		onBeforeAction: function () {
			K.Profile.logout();
			K.Map.destroy();
			Router.go('home');
		}
	});

	this.route('root', {
		path: '/',
		template: 'empty',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', false);
		}
	});

	this.route('profile', {
		path: '/profile',
		template: 'panelProfile',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
		},
		data: function() {
			return K.Profile.user;
		}
	});

	this.route('panelSettings', {
		path: '/settings',
		template: 'panelSettings',
		layoutTemplate: 'layoutMap',
		loadingTemplate: 'pageLoading',
		waitOn: function() {
			Session.set('showSidebar', true);
		},		
		data: function() {
			return Meteor.user();
		}
	});

//TODO use panel list
	this.route('panelSettingsBlock', {
		path: '/settings/blocked',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		loadingTemplate: 'pageLoading',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('usersByIds', K.Profile.data.usersBlocked );
		},
		data: function() {
			if(!this.ready()) return null;
			return {
				title: i18n('title_settingsBlocked'),
				className: 'settingsBlocked',
				itemsTemplate: 'item_user_blocked',
				items: _.map(K.Profile.data.usersBlocked, K.userById)
			};
		}
	});

	this.route('friends', {
		path: '/friends',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('friendsByIds', K.Profile.data.friends);
		},
		data: function() {
			if(!this.ready()) return null;
			var users = K.findFriendsByIds(K.Profile.data.friends).fetch(),
				userIds = _.pluck(users,'_id');
			return {
				title: i18n('title_friends'),
				className: 'friends',			
				headerTemplate: 'search_user',
				itemsTemplate: 'item_user_friend',
				items: _.map(userIds, K.userById),
				sortBy: function(user) {
					var status = user.status || 'offline',
						ords = ['online','away','offline'];
					return ords.indexOf(status);
				}
			};
		}	
	});

	this.route('usersNews', {
		path: '/users/news',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('usersByDate');
		},
		data: function() {
			if(!this.ready()) return null;
			var users = K.findUsersByDate().fetch(),
				userIds = _.pluck(users,'_id');
			return {
				title: i18n('title_usersNews'),
				className: 'usersNews',			
				headerTemplate: 'search_user',
				itemsTemplate: 'item_user_search',
				items: _.map(userIds, K.userById)
			};
		}	
	});

	this.route('placesNearby', {
		path: '/places/nearby',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			if(!K.Map.ready()) return null;

			Session.set('showSidebar', true);
			var loc = K.Map.getCenter(),
				places = K.findPlacesByNearby(loc).fetch();
			return Meteor.subscribe('placesByNearby', loc);
		},
		data: function() {
			if(!this.ready() || !K.Map.ready()) return null;

			var loc = K.Map.getCenter(),
				places = K.findPlacesByNearby(loc).fetch();

			//debugging maxDistance L.circleMarker(loc,{radius:10}).addTo(K.Map.map);

			return {
				title: i18n('title_placesNearby'),
				className: 'placesNearby',
				headerTemplate: 'search_place',
				itemsTemplate: 'item_place_search',
				items: _.map(places, function(place) {
					return K.placeById(place._id);
				})
			};
		}
	});

	this.route('placesNews', {
		path: '/places/news',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('placesByDate');
		},
		data: function() {
			if(!this.ready()) return null;
			
			var places = K.findPlacesByDate().fetch();

			return {
				title: i18n('title_placesNews'),
				className: 'placesNews',
				headerTemplate: 'search_place',
				itemsTemplate: 'item_place_search',
				items: _.map(places, function(place) {
					return K.placeById(place._id);
				})
			};
		}
	});

	this.route('hist', {
		path: '/history',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('placesByIds', K.Profile.data.hist);
		},
		data: function() {
			if(!this.ready()) return null;
			return {
				title: i18n('title_histplaces'),
				className: 'history',
				itemsTemplate: 'item_place',
				items: _.map(K.Profile.data.hist, K.placeById)
			};
		}
	});

	this.route('panelPlace', {
		path: '/place/:placeId',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('placeById', this.params.placeId);
		},
		data: function() {
			if(!this.ready()) return null;
			var place = K.placeById( this.params.placeId );
			
			if(!place){
				Router.go('root');
				return null;
			}

			place.update();	//update instance adding new fields by placeById

			return place.rData();
		}
	});

	this.route('placeMap', {
		path: '/place/:placeId/map',
		template: 'empty',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', false);
			return Meteor.subscribe('placeById', this.params.placeId);
		},
		onAfterAction: function() {
			if(!this.ready()) return null;

			var place = K.placeById( this.params.placeId );

			if(place)
				place.showLoc();
		}
	});

	this.route('placeCheckins', {
		path: '/place/:placeId/checkins',
		template: 'panelList',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			return Meteor.subscribe('usersByPlace', this.params.placeId);
		},
		data: function() {
			if(!this.ready()) return null;
			var place = K.placeById(this.params.placeId);
			return place && {
				title: i18n('title_checkins', place.name),
				className: 'checkins',
				itemsTemplate: 'item_user',
				items: _.map(place.checkins, function(id) {
					return K.userById(id);
				})
			};
		}
	});

	this.route('panelUser', {
		path: '/user/:userId',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', true);
			if(this.params.userId===Meteor.userId())
				Router.go('profile');
			else
				return Meteor.subscribe('userById', this.params.userId);
		},
		data: function() {
			if(this.ready()) {
				var user = K.userById(this.params.userId);
				
				if(!user){
					Router.go('root');
					return null;
				}

				user.update();	//update instance adding new fields by userById
				
				return user.rData();
			}
			else
				this.render(this.loadingTemplate);
		}
	});

	this.route('userMap', {
		path: '/user/:userId/map',
		template: 'empty',
		layoutTemplate: 'layoutMap',
		waitOn: function() {
			Session.set('showSidebar', false);
			return Meteor.subscribe('friendsByIds', [this.params.userId]);
		},
		onAfterAction: function() {
			var user = K.userById( this.params.userId );

			if(user)
				user.showLoc();
		}
	});	

});
