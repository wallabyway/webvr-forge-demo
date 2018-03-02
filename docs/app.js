	var options = {
	  env: "Local",
	  useADP: false,
	  useConsolidation: true,
	  urn: window.location.search.split("=")[1]
	}

	function loadObj(baseURL, geometry){
	    return new Promise(function(resolve, reject){
	        const mtlLoader = new THREE.MTLLoader()
	        mtlLoader.setPath(baseURL)
	        const mtlName = geometry.split('.')[geometry.split(':').length - 1] + '.mtl'
	        mtlLoader.load(mtlName, (materials) => {
	            materials.preload();
	            let objLoader = new THREE.OBJLoader()
	            objLoader.setMaterials(materials)
	            objLoader.setPath(baseURL)
	            objLoader.load(geometry, (obj) => {
	                resolve(obj)
	            }, () => {} , (...params) => {
	                console.error('Failed to load obj', ...params)
	                reject(...params)
	            })
	        })
	    })
	}
	window.ring = {};
	window.rift = {};
	var viewer = {};
	var ax = -50, ay = 50, az = 50;

	function rayhit_highlight(rift, cursor) {
		if (!rift.position) return;
		var pos = new THREE.Vector3(rift.position.x, rift.position.y, 10);
		var ray = new THREE.Ray(pos,new THREE.Vector3(0,0,1));
		var nodes = viewer.impl.rayIntersect(ray,true);
		if (nodes && nodes.dbId)
			viewer.select(nodes.dbId);
		if (nodes && nodes.dbId) {
			console.log(nodes);
			cursor.position.set(nodes.intersectPoint.x, nodes.intersectPoint.y, nodes.intersectPoint.z);
		}
	}

	function loadVRCursors(scene) {
        // Add some lights to the scene
        scene.add(new THREE.AmbientLight('#777', 0.2));
        var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
        pointLight.position.set(10, 10, 10);
        scene.add( pointLight );

        // Add the rift hand controller OBJ
        loadObj('','cursor.obj').then(ring => {
        	// Add Rift hand controller
            ring.scale.set(.05, .05, .05);
            ring.position.set(0, 0, -5);
            ring.rotation.x = -Math.PI/2+0.2
            scene.add(ring);
            window.ring = ring;
        });


        // Add the rift hand controller OBJ
        loadObj('','rift.obj').then(rift => {

        	// Add Rift hand controller
            rift.scale.set(.1, .1, .1);
            rift.position.set(0, 0, -5);
            rift.rotation.x = -Math.PI/2
            scene.add(rift);

        	// Add laser pointer
			var linemat = new THREE.LineBasicMaterial( { color: 0xff00ff } );
			var linegeom = new THREE.Geometry();
			linegeom.vertices.push(new THREE.Vector3( 0, 0, 0) );
			linegeom.vertices.push(new THREE.Vector3( 0, 1000, 0) );
			var line = new THREE.Line( linegeom, linemat );
			rift.add(line);

            // faux movement test
        	window.addEventListener('mousemove', (e) => {
            	window.rift.position.x=ax+e.x/10.0;
            	window.rift.position.y=ay-e.y/10.0;
            	window.rift.position.z=az;
            	rayhit_highlight(window.rift, window.ring);
            	viewer.impl.invalidate(true);
            });
            // for debugging only
            window.rift = rift;

        }).catch((...params) =>{
            console.error('could not load obj file', ...params)
        })

	}



    function initializeViewer() {
	    window.devicePixelRatio=1.25;

		viewer = new Autodesk.Viewing.Private.GuiViewer3D(document.getElementById('forgeViewer'), {});
		Autodesk.Viewing.Initializer( options, function() {
		  viewer.start(options.urn, options, onSuccess);            
		});
		function onSuccess() {
		  //viewer.loadExtension('Autodesk.Viewing.WebVR');
		  viewer.impl.setFPSTargets(48,60,120);
		  viewer.impl.toggleProgressive(true);	
		  loadVRCursors(viewer.impl.sceneAfter);
  			var g = new THREE.BoxGeometry( 1, 1, 1 );
			var m = new THREE.MeshPhongMaterial( { color: 0x00FF00 });
			viewer.impl.matman().addMaterial( 'd', m, true);
			var cube = new THREE.Mesh( g, m );
			//viewer.impl.sceneAfter.add( cube );
  			cube.position.x = 10; cube.position.y = 10;
		}
	}
