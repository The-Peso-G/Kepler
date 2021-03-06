
Kepler.Osm = {
	
	loadById: function(osmId) {

		Meteor.call('findOsmById', osmId, function(err, geojson) {

			if(err)
				console.log('loadById', err)
			else if(geojson && geojson.features.length) {

				geojson.features = _.map(geojson.features, function(f) {
					f.templatePopup = 'popupGeojson_osm';
					return f;
				});
				K.Map.hideCursor();
				K.Map.layers.geojson.clearLayers().addData(geojson);
				K.Map.layers.geojson.invoke('openPopup');
			}
		});
	},

	loadByLoc: function(loc, cb) {

		var opts = {
			tags: '~".*"~".*"',//'highway~".*"',
			types: ['way','node'],
			limit: 1
		};

		Meteor.call('findOsmByLoc', loc, opts, function(err, geojson) {

			if(err){
				console.log('findOsmByLoc',err)
			}
			else if(geojson && geojson.features.length) {

				geojson.features = _.map(geojson.features, function(feature) {
					feature.templateMarker = 'markerOsm';
					feature.templatePopup = 'popupGeojson_osm';
					return feature;
				});
				K.Map.hideCursor();
				K.Map.addGeojson(geojson, {noFitBounds: true});
			}
			if(_.isFunction(cb))
				cb(geojson);
		});
	},

	importPlace: function(osmId, cb) {
		
		Meteor.call('insertPlaceByOsmId', osmId, function(err, placeId) {

			if(err)
				console.log(err)
			else {
				
				K.Map.layers.geojson.clearLayers();

				//Router.go('panelPlace', {placeId: placeId});
				Router.go('panelPlaceEdit', {placeId: placeId});

				K.Map.addItem(K.placeById(placeId));

				K.Map.hideCursor();
			}
			if(_.isFunction(cb))
				cb(placeId);
		});
	}
};
