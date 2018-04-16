
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

var HEIGHT, WIDTH;


function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

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
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}


function init(event){
  
  createScene();
  createLights();
  

  var loader = new THREE.JSONLoader();
  loader.load( "https://deadded.github.io/space/js/flamingo.js", function( geometry ) {
      var material = new THREE.MeshPhongMaterial( {
          color: 0xffffff,
          morphTargets: true,
          vertexColors: THREE.FaceColors,
          flatShading: true
      } );
      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = - 150;
      mesh.position.y = 150;
      mesh.scale.set( 1.5, 1.5, 1.5 );
      scene.add( mesh );
      var mixer = new THREE.AnimationMixer( mesh );
      mixer.clipAction( geometry.animations[ 0 ] ).setDuration( 1 ).play();
      mixers.push( mixer );
  } );

  loop();
}



window.addEventListener('load', init, false);
