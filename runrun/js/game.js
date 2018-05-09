
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, clock, mixer, cloud;

var flamingo;

var HEIGHT, WIDTH;

var ground;

var lCloudsPos = -160;
var rCloudsPos = - lCloudsPos;

var cloudH = 1046;

var sideClouds;

var lSideCloudsCount = 20;
var rSIdeCloudsCount = lSideCloudsCount - 1;
angle = 2 * Math.PI / lSideCloudsCount;

clock = new THREE.Clock();


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
  scene.fog = new THREE.Fog(0xd96784, 100,950);
  camera.position.x = 0;
  camera.position.y = 950;
  camera.position.z = 600;
  
  
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


  //geom.mergeVertices();

  var l = geom.vertices.length;

  this.waves = [];

  for(var i = 0; i < l; i++){

    var v = geom.vertices[i];

    this.waves.push({y: v.y,
                     x: v.x,
                     z: v.z,
                     ang: Math.random()*Math.PI*2,
                     amp: 5 + Math.random() * 15,
                     speed: 0.016 + Math.random() * 0.062
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

  ground.mesh.position.x = 0;
  ground.mesh.position.y = 0;
  ground.mesh.position.z = 0;

  scene.add(ground.mesh);
}


Cloud = function(){
  this.mesh = new THREE.Object3D();
 var geom = new THREE.BoxGeometry(15,15,15);
	
 var mat = new THREE.MeshPhongMaterial({
 	color: 0xffffff});

 var blocksCount = 5 + Math.floor( Math.random()*3);
	
 for(var i = 0; i < blocksCount; i++)
 {
	 var m = new THREE.Mesh(geom, mat);
	 
	 m.position.x = i*5 + Math.floor(Math.random() * 5);
	 m.position.y = Math.random()*10;
	 m.position.z = Math.random()*10;
	 
	 m.rotation.z = Math.random() * Math.PI * 2;
	 m.rotation.y = Math.random() * Math.PI * 2;
	 
	 var s = 0.3 + Math.random() * 0.7;
	 m.scale.set(s,s,s);
	 
	 m.castShadow = true;
	 m.receiveShadow = true;
	 
	 this.mesh.add(m)
 }
	var rand = 0 - 0.5 + Math.random() * (6 - 0 + 1)
    	rand = Math.round(rand);
	this.mesh.rotateZ((Math.PI / 6) * rand);
	//this.mesh.position.x = -150;
}

SideClouds = function(){
	
	this.mesh = new THREE.Object3D();
	
	for(var i = 0; i < lSideCloudsCount; i++)
	{
		var c = new Cloud();
		
		var a = 2 * angle * i;
		
		c.mesh.position.z = Math.cos(a) * cloudH;
		c.mesh.position.y = Math.sin(a) * cloudH;
		c.mesh.position.x = lCloudsPos;
		
		this.mesh.add(c.mesh);
	}
}
function createSideClouds(){
	sideClouds = new SideClouds();
	scene.add(sideClouds.mesh);
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
	cloud.mesh.position.z = -Math.cos(clock.elapsedTime) * 1046;
	cloud.mesh.position.y = Math.sin(clock.elapsedTime) * 1046;
	
	sideClouds.mesh.rotation.x += 0.007;
  renderer.clear();
  renderer.render(scene, camera);
  
}


function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();
  createGround();
  createSideClouds();
  //clock = new THREE.Clock();

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
          flamingo.position.y = 930;
	  flamingo.position.z = 480;
          flamingo.scale.set(.3,.3,.3);
	  flamingo.rotateY(Math.PI);

          scene.add(flamingo);
		
          mixer = new THREE.AnimationMixer(flamingo);
          mixer.clipAction(geometry.animations[0]).setDuration(1).play();

				} );
	
  
 /*var cloudGeom = new THREE.BoxGeometry(10,10,10);
 var cloudMat = new THREE.MeshPhongMaterial({
	 color: 0xffffff,
	 flatShading: true});
  cloud = new THREE.Mesh(cloudGeom, cloudMat);*/
	cloud = new Cloud();
  cloud.mesh.position.y = -750;
  cloud.mesh.position.z = -400;

  
 scene.add(cloud.mesh);
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
  console.log(flaPos.distanceTo(cloud.mesh.position));
	if(flaPos.distanceTo(cloud.mesh.position) < 5)
		alert("COLLISION!!!");
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

