function demo(){
	this.viewer = new Cesium.Viewer('cesiumContainer');

	this.btn_random = $("#random");
	this.btn_surround = $("#surround");
	this.btn_fly = $("#fly");
	this.p_info = $("#info");

	this.places = [
		{name: "the Alps",lot: 6.87, lat: 45.73, alt: 15000},
		{name: "a certain dead volcano",lot: -122.18, lat: 46.12, alt: 10000},
		{name: "Beijing",lot: 116.39, lat: 39.85, alt: 7000},
		{name: "Paris",lot: 2.33, lat: 48.79, alt: 7000},
		{name: "the Himalayas",lot: 86.91, lat: 27.89, alt: 20000},
		{name: "San Diego",lot: -117.21, lat: 32.71, alt: 7000}
	];
	this.cur_place = -1;

	this.globe = true;
	this.surround_on = false;
	this.fly_on = false;

	this.lot = 0;
	this.lat = 0;
	this.alt = 0;
	this.heading = -90;
	this.speed = 0;

	this.flags = {
    	move_left: false,
    	move_right: false,
    	spped_up: false,
    	speed_down: false
	};
}
demo.prototype = {
	init: function(){
		this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    		url : '//assets.agi.com/stk-terrain/world'
		});
		this.initPlane();
		this.p_info.html("Terrain effect is open so it would be a little slow.<br/>You can go to a random place by clicking the first button above or start a surround view by pressing the second button.");
		this.btn_fly.addClass("disabled");
		this.viewer.scene.screenSpaceCameraController.enableZoom = false;
		this.btn_random.bind("click",this.goToARandomPlace.bind(this));
		this.btn_surround.bind("click",this.startSurround.bind(this));
		this.btn_fly.bind("click",this.flyByPlane.bind(this));
	},

	goToARandomPlace: function(){
		this.changePlace();
		this.globe = false;
		this.flyTo(this.places[this.cur_place].lot, this.places[this.cur_place].lat, this.places[this.cur_place].alt, -45, 3.0, function(){
        	this.p_info.html("Now you are at <span>" + this.places[this.cur_place].name + "</span> and you can still go to another random place or start a surround view.<br/>More interestingly, you can also take a plane to travel arround by pressing the third button.");
        	this.btn_fly.removeClass("disabled");
        	this.btn_random.removeClass("disabled");
    		this.btn_surround.removeClass("disabled");
        }.bind(this));
        this.btn_fly.addClass("disabled");
    	this.btn_random.addClass("disabled");
    	this.btn_surround.addClass("disabled");
    	this.p_info.html("flying!");
		
	},
	startSurround: function(){
		if (this.surround_on) {
			this.surround_callback();
			this.surround_on = false;
			this.btn_surround.text("start a surround view");
			this.btn_random.removeClass("disabled");
			if (this.globe) {
				this.p_info.html("Terrain effect is open so it would be a little slow.<br/>You can go to a random place by clicking the first button above or start a surround view by pressing the second button.");
			}
			else {
				this.p_info.html("Now you are at <span>" + this.places[this.cur_place].name + "</span> and you can still go to another random place or start a surround view.<br/>More interestingly, you can also take a plane to travel arround by pressing the third button.");
				this.btn_fly.removeClass("disabled");
			}
		}
		else {
			if (this.cur_place == -1) {
				this.cur_place = Math.floor(Math.random() * this.places.length);
			}
			this.surround_callback = this.viewer.clock.onTick.addEventListener(function(clock){
				this.rotate(this.places[this.cur_place].lot, this.places[this.cur_place].lat, this.places[this.cur_place].alt, 0.02);
			}.bind(this));
			this.surround_on = true;
			this.btn_surround.text("end the surround view");
			this.btn_random.addClass("disabled");
			this.btn_fly.addClass("disabled");
			this.p_info.html("Now you are in a surround view.<br/>Press the second button to end it.");
		}
	},
	flyByPlane: function(){
		if (this.fly_on) {
			this.lot = 0;
			this.lat = -90;
			this.alt = 0;
			this.heading = -90;
			this.speed = 0;
			this.flyTo(this.places[this.cur_place].lot, this.places[this.cur_place].lat, this.places[this.cur_place].alt, -45, 3.0, function(){
        		this.p_info.html("Now you are at <span>" + this.places[this.cur_place].name + "</span> and you can still go to another random place or start a surround view.<br/>More interestingly, you can also take a plane to travel arround by pressing the third button.");
        		this.btn_random.removeClass("disabled");
    			this.btn_surround.removeClass("disabled");
    			this.btn_fly.removeClass("disabled");
    			this.btn_fly.text("take a plane to travel!");
    			this.viewer.scene.screenSpaceCameraController.enableRotate = true;
				this.viewer.scene.screenSpaceCameraController.enableTilt = true;
				this.viewer.scene.screenSpaceCameraController.enableLook = true;
				this.positionModel();
        	}.bind(this));
        	this.fly_on = false;
    		this.p_info.html("flying!");
    		this.btn_fly.addClass("disabled");
    		this.fly_callback();
			this.key_callback();		
		}
		else {
			this.alt = this.places[this.cur_place].alt / 2;
			this.lot = this.places[this.cur_place].lot;
			this.lat = this.places[this.cur_place].lat - (this.alt / Math.tan(Cesium.Math.toRadians(20)) - this.alt * 2) * 180 / (6371000 * Math.PI);
			this.heading = -90;
			this.speed = 0;
			this.flyTo(this.lot, this.lat -  (this.alt * 180) / (Math.tan(Cesium.Math.toRadians(20)) * 6371000 * Math.PI), this.alt * 2, -20, 2.0, function(){
				this.p_info.html("Now you can control the plane to fly anywhere you like!<br/>Press the 'left', 'right', 'up' and 'down' button for turning left, turning right, speed up and speed down respectively.<br/><br/>Press the third button to exit the flight.");
				this.btn_fly.text("exit the flight now");
				this.btn_fly.removeClass("disabled");
				this.makePlaneMove();
			}.bind(this));
			this.fly_on = true;
			this.p_info.html("Please wait for the plane to be rendered.");
			this.btn_random.addClass("disabled");
	    	this.btn_surround.addClass("disabled");
	    	this.btn_fly.addClass("disabled");
	    	this.positionModel();
	    	this.viewer.scene.screenSpaceCameraController.enableRotate = false;
			this.viewer.scene.screenSpaceCameraController.enableTilt = false;
			this.viewer.scene.screenSpaceCameraController.enableLook = false;
		}
	},

	changePlace: function(){
		do {
			var p = Math.floor(Math.random() * this.places.length);
		}
		while (p == this.cur_place);
		this.cur_place = p;
	},
	flyTo: function(lot, lat, alt, pitch, duration, callback){
		this.viewer.camera.flyTo({
        	destination: Cesium.Cartesian3.fromDegrees(lot, lat, alt),
        	orientation: {
            	heading: Cesium.Math.toRadians(0),
            	pitch: Cesium.Math.toRadians(pitch),
            	roll: 0.0
        	},
        	duration: duration,
        	complete: callback
    	});
	},
	rotate: function(lot,lat,alt,distance){
		this.viewer.camera.rotate(Cesium.Cartesian3.fromDegrees(lot, lat + (alt * 180 / (6371000 * Math.PI))), distance);
	},
	initPlane: function(){
		var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromDegrees(0, -90, 0), 0, 0, 0);
		var model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
		    url : '../Apps/SampleData/models/CesiumAir/Cesium_Air.gltf',
		    modelMatrix : modelMatrix,
		    scale : 200.0
		}));
		this.model = model;
		Cesium.when(model.readyPromise).then(function(model) {
		    model.activeAnimations.addAll({
		        loop : Cesium.ModelAnimationLoop.REPEAT
		    });
		});
		model.readyToRender.addEventListener(function(model) {
        	model.activeAnimations.addAll({
		    loop : Cesium.ModelAnimationLoop.REPEAT,
		    speedup : 0.5,
		    reverse : true
			});
        });
	},
	positionModel: function() { 
		var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromDegrees(this.lot, this.lat, this.alt), Cesium.Math.toRadians(this.heading), 0, 0);
	   	this.model.modelMatrix = modelMatrix; 
	},
	makePlaneMove: function(){
		this.fly_callback = this.viewer.clock.onTick.addEventListener(function(clock){
			this.positionModel();
			this.viewer.camera.setView({
    			position : Cesium.Cartesian3.fromDegrees(this.lot, this.lat, this.alt),
    			heading : Cesium.Math.toRadians(this.heading + 90),
    			pitch: Cesium.Math.toRadians(-20)
			});
			this.viewer.camera.moveBackward(this.alt / Math.sin(Cesium.Math.toRadians(20)));
			if (this.flags.move_left) {
		        this.heading -= 2;
		    }
		    if (this.flags.move_right) {
		       	this.heading += 2;
		    }
		    if (this.flags.speed_up) {
		        this.speed += 0.0001;
		        if (this.speed > 0.007) {
		        	this.speed = 0.007
		        }
		    }
		    if (this.flags.speed_down) {
		        this.speed -= 0.0001;
		        if (this.speed < 0) {
		        	this.speed = 0;
		        }
		    }
     		this.lot += Math.sin(Cesium.Math.toRadians(this.heading + 90)) * this.speed;
     		this.lat += Math.cos(Cesium.Math.toRadians(this.heading + 90)) * this.speed;
		}.bind(this));
		$(document).keydown(function(e){ 
			if(e.keyCode == 37){
				this.flags.move_left = true;
			}else if (event.keyCode == 38){ 
				this.flags.speed_up = true;
			}else if (event.keyCode == 39){ 
				this.flags.move_right = true;
			}else if (event.keyCode == 40){ 
				this.flags.speed_down = true;
			}
		}.bind(this)); 
		$(document).keyup(function(e){ 
			if(e.keyCode == 37){
				this.flags.move_left = false;
			}else if (event.keyCode == 38){ 
				this.flags.speed_up = false;
			}else if (event.keyCode == 39){ 
				this.flags.move_right = false;
			}else if (event.keyCode == 40){ 
				this.flags.speed_down = false;
			}
		}.bind(this)); 
		this.key_callback = this.viewer.clock.onTick.addEventListener(function(clock) {
		});
	}
}
new demo().init();