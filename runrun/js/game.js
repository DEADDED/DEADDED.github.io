
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, clock, mixer;

var flamingo;

var HEIGHT, WIDTH;

var ground;


function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 2000000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xd96784, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
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



Ground = function(){
  
  var geom = new THREE.SphereGeometry(1000,30,30);

  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));


  geom.mergeVertices();

  var l = geom.vertices.length;

  this.waves = [];

  for(var i = 0; i < l; i++){

    var v = geom.vertices[i];

    this.waves.push({y: v.y,
                     x: v.x,
                     z: v.z,
                     ang: Math.random()*Math.PI*2,
                     amp: 5 + Math.random() * 30,
                     speed: 0.032 + Math.random() * 0.062
                  });
  }

  var material = new THREE.MeshPhongMaterial({
    color: 0x04579A,
    shading:THREE.FlatShading});

  this.mesh = new THREE.Mesh(geom,material);

  this.mesh.recieveShadow = true;
}

Ground.prototype.moveWaves = function(){

  var verts = this.mesh.geometry.vertices;
  var l = verts.length;

  for(var i = 0; i < l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    
    v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

    vprops.ang += vprops.speed;

  }

  this.mesh.geometry.verticesNeedUpdate = true;

}

function createGround(){
  ground = new Ground();

  ground.mesh.position.y = -750;
  ground.mesh.position.z = -400;

  scene.add(ground.mesh);
}





function loop(){
   //updateFlamingo();	
	
  requestAnimationFrame(loop);
  //camera.rotation.z += 0.001;

  var delta = clock.getDelta();
  mixer.update(delta);
				/*for ( var i = 0; i < mixers.length; i ++ ) {
					mixers[ i ].update( delta );
				}*/
  //flamingo.rotation.y += 0.1;
	//flamingo.position.x += 1;
	ground.moveWaves();
  ground.mesh.rotation.x += 0.005;
	updateFlamingo();	
  renderer.clear();
  renderer.render(scene, camera);
  
}


function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();
  createGround();
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
          flamingo.position.y = 180;
	  flamingo.position.z = 80;
          flamingo.scale.set(.5,.5,.5);
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
		
		//flamingo.rotation.z += fPos/300;
	if(flamingo.position.x > 400)
		flamingo.position.x = 400;
	else if(flamingo.position.x < -400)
		flamingo.position.x = -400;
	
	
	 var flaPos = new THREE.Vector3();
  flaPos = flaPos.setFromMatrixPosition( flamingo.matrixWorld );
	//alert(flaPos);
	//treePos.distanceTo(heroSphere.position)
  //console.log(flaPos.distanceTo(ground.mesh.position));
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

