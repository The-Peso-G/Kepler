

Template.pageAdminPlaces.onCreated(function() {

	Session.set('itemSelected', null);
});

Template.pageAdminPlaces.onRendered(function() {
	var self = this;

	$(self.firstNode).find('.list-group').btsListFilter('.items-search', {
		itemChild: '.place-btn-name',
		loadingClass: 'loading-lg',
		sourceData: function(val, callback) {
			
			Meteor.subscribe('placesByName', val, function() {
				
				var items = _.map( K.findPlacesByName(val).fetch(), function(item) {
					return K.placeById(item._id);
				});

				callback(items);
			});
		},
		sourceNode: function(data) {
			var item$ = $('<div>');
			Blaze.renderWithData(Template.itemPlaceAdmin, data, item$[0]);
			return item$[0].firstChild;
		},
		cancelNode: function() {
			return self.$('.search-canc');
		}
	});

});

Template.pageAdminPlaces.events({
	'click .items-list .list-group-item': function(e,tmpl) {

		var li$ = $(e.currentTarget),
			input$ = li$.find('input.btn-itemselect');
		input$.prop('checked',true);
		
		input$.trigger('change');

		li$.siblings().removeClass('selected')
		.end().addClass('selected');
	},

	'change input.btn-itemselect': function(e,tmpl,val) {
		var input$ = $(e.target),
			itemId = input$.val();
		
		console.log('change', itemId);
//
//TODO MOVE TO ROUTER
//
		Meteor.subscribe('placeById', itemId, function() {
			console.log('subscribe',itemId)

			$('.panel.pageAdmin').remove()
			Session.set('itemSelected', itemId);

		});
	}

});

Template.pageAdminPlaces.helpers({
	itemSelected: function() {
		var id = Session.get('itemSelected'),
			place = id && K.placeById(id);
		if(place)
			place.update();
		return place;
	}
});

Template.itemPlaceAdmin_admin_btns.onRendered(function() {
	var self = this;
	self.$('.item-btn-del').btsConfirmButton(function(e) {
		e.stopPropagation();
		K.Admin.removePlace(self.data.id);
		Session.set('itemSelected',null);
	});
});