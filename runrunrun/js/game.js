
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, clock, mixer;

var HEIGHT, WIDTH;

var sea;
var flamingo, clock;

var basicGroundRotation = 0.005;

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 1000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0x04579A, 100,950);
  camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;
 // camera.roateX(M)
  
  //camera.rotation.z = Math.PI / 2;
 
  

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}


// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0xffffff, .9)
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
}



Sea = function(){
	
	// create the geometry (shape) of the cylinder;
	// the parameters are: 
	// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
	var geom = new THREE.CylinderGeometry(1000,1000,1000,80,40);
	
	// rotate the geometry on the x axis
	//geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	
	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color:0x68c3c0,
		transparent:true,
		opacity:.6,
		shading:THREE.FlatShading,
	});

	// To create an object in Three.js, we have to create a mesh 
	// which is a combination of a geometry and some material
	this.mesh = new THREE.Mesh(geom, mat);

	// Allow the sea to receive shadows
	this.mesh.receiveShadow = true; 
}

// Instantiate the sea and add it to the scene:

var sea;

function createSea(){
	sea = new Sea();

	// push it a little bit at the bottom of the scene
  sea.mesh.position.y = 0;
  sea.mesh.position.z = -1100;

	// add the mesh of the sea to the scene
	scene.add(sea.mesh);
}



function loop(){
requestAnimationFrame(loop);
  //camera.rotation.z += 0.001;

  //var delta = clock.getDelta();
	var delta = clock.getDelta();
  mixer.update(delta);
  //mixer.update(delta);
				/*for ( var i = 0; i < mixers.length; i ++ ) {
					mixers[ i ].update( delta );
        }*/

  renderer.render(scene, camera);
  
}


function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);
  //window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();
  createSea();
  
  clock = new THREE.Clock();

  var loader = new THREE.JSONLoader();
	loader.load( 'js/flamingo.js', function( geometry ) {
	var material = new THREE.MeshPhongMaterial( { 
            color: 0xffffff, 
            morphTargets: true, 
            vertexColors: THREE.FaceColors, 
            flatShading: true 
          } );
          
          flamingo = new THREE.Mesh(geometry, material);
	  
          flamingo.position.x = 0;
          flamingo.position.y = 100;
	  flamingo.position.z = 100;
          flamingo.scale.set(.1,.1,.1);
	  flamingo.rotateY(Math.PI);
	  flamingo.rotateX(-Math.PI/2);

          scene.add(flamingo);
		
          mixer = new THREE.AnimationMixer(flamingo);
          mixer.clipAction(geometry.animations[0]).setDuration(1).play();

				} );

  
  loop();
}



window.addEventListener('load', init, false);
