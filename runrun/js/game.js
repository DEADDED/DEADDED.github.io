
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, clock, mixer;

var HEIGHT, WIDTH;


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
  scene.fog = new THREE.Fog(0xff0000, 100,950);
  camera.position.x = 0;
  camera.position.z = 500;
  camera.position.y = 200;
  
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

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
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









function loop(){
	
  requestAnimationFrame(loop);
  //camera.rotation.z += 0.001;

  var delta = clock.getDelta();
  mixer.update(delta);
				/*for ( var i = 0; i < mixers.length; i ++ ) {
					mixers[ i ].update( delta );
				}*/
  renderer.clear();
  renderer.render(scene, camera);
  
}


function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);
  //window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();

  clock = new THREE.Clock();

  //mixer = new THREE.AnimationMixer( scene );

  var loader = new THREE.JSONLoader();
				loader.load( 'js/flamingo.js', function( geometry ) {
					var material = new THREE.MeshPhongMaterial( { 
            color: 0xffffff, 
            morphTargets: true, 
            vertexColors: THREE.FaceColors, 
            flatShading: true 
          } );
          
          var mesh = new THREE.Mesh(geometry, material);

          mesh.position.x = 0;
          mesh.position.y = 100;
          mesh.scale.set(1.5,1.5,1.5);
	  mesh.rotateY(Math.PI);

          scene.add(mesh);

          mixer = new THREE.AnimationMixer(mesh);
          mixer.clipAction(geometry.animations[0]).setDuration(1).play();

				} );

  
  loop();
}



window.addEventListener('load', init, false);