
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, clock, mixer;

var flamingo;

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
  scene.fog = new THREE.Fog(0x000000, 100,950);
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




Sea = function(){
  var geom = new THREE.CylinderGeometry(1200,600,800,40,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:5 + Math.random()*15,
                     speed:0.016 + Math.random()*0.032
                    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:0x29506D,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed;
  }
  this.mesh.geometry.verticesNeedUpdate=true;
  sea.mesh.rotation.z += .005;
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -600;
  scene.add(sea.mesh);
}




function loop(){
   //updateFlamingo();	
	
  requestAnimationFrame(loop);
  //camera.rotation.z += 0.001;
sea.moveWaves();
  var delta = clock.getDelta();
  mixer.update(delta);
				/*for ( var i = 0; i < mixers.length; i ++ ) {
					mixers[ i ].update( delta );
				}*/
  //flamingo.rotation.y += 0.1;
	//flamingo.position.x += 1;
	updateFlamingo();	
  renderer.clear();
  renderer.render(scene, camera);
  
}


function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();
  createSea();

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
          
          flamingo = new THREE.Mesh(geometry, material);

          flamingo.position.x = 0;
          flamingo.position.y = 50;
          flamingo.scale.set(1.5,1.5,1.5);
	  flamingo.rotateY(Math.PI);

          scene.add(flamingo);
		
          mixer = new THREE.AnimationMixer(flamingo);
          mixer.clipAction(geometry.animations[0]).setDuration(1).play();

				} );

  
  loop();
}
var fPos, oldPos;

function updateFlamingo(){
	
	flamingo.position.x += fPos;
	flamingo.rotation.z += fPos/300;
	if(flamingo.position.x > 400)
		flamingo.position.x = 400;
	else if(flamingo.position.x < -400)
		flamingo.position.x = -400;
	
	/*if(oldPos < fPos)
		flamingo.rotation.z += 0.03;
	else if (oldPos> fPos)
		flamingo.rotation.z -= 0.03;
	
	else
		flamingo.rotation.z = - Math.PI;*/
	
	/*if(flamingo.rotation.z >= Math.PI / 4)
		flamingo.rotation.z = Math.PI/4;
	else if(flamingo.rotation.z <= -Math.PI/4)
		flamingo.rotation.z = -Math.PI/4;*/
	oldPos = fPos;
}

function handleOrientation(event){
	fPos = event.accelerationIncludingGravity.y;
}


window.addEventListener('load', init, false);
