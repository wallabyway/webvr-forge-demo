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
	window.obj = {};
	var viewer = {};


	function loadControllers(scene) {
	                    // Add the obj
	                    loadObj('','rift.obj').then(object => {
	                        object.scale.set(.1, .1, .1);
	                        object.position.set(0, 0, -5);
	                        //object.rotation.x = -Math.PI/2
	                        scene.add(object);
	                        window.obj = object;

	                        // Add some lights to the scene
	                        scene.add(new THREE.AmbientLight('#777', 0.2));
	                        var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	                        pointLight.position.set(10, 10, 10);
	                        scene.add( pointLight );

	                        // faux movement test
	                        //window.setTimeout(()=> 
	                        	window.addEventListener('mousemove', (e) => {
		                        	window.obj.position.x=e.x/10.0;
		                        	window.obj.position.z=e.y/10.0;
		                        	viewer.impl.invalidate(true);
		                        });
		                    //,3000);

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
		  loadControllers(viewer.impl.sceneAfter);	  
		}
	}
