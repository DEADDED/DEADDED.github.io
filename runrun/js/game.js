
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, clock, mixer;

var flamingo;

var HEIGHT, WIDTH;

var ground;

var lCloudsPos = -250;
var rCloudsPos = - lCloudsPos;

var cloudH = 1046;
var score = 0;

var globalRot = 0.785;
var rotUpdate = 0.008;

var sideClouds;
var flaPos = new THREE.Vector3();

//var clouds = [];

var row;

var cloudRows = [];

var targetVector = new THREE.Vector3();
var newTarget = new THREE.Vector3();


var sideCloudsCount = 12;
angle = 2 * Math.PI / sideCloudsCount;

clock = new THREE.Clock(false);
clock.start();


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
  scene.fog = new THREE.Fog(0xd96784, 100,950);
  camera.position.x = 0;
  camera.position.y = 950;
  camera.position.z = 600;
  
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

  var l = geom.vertices.length;

  this.waves = [];

  for(var i = 0; i < l; i++){

    var v = geom.vertices[i];

    this.waves.push({y: v.y,
                     x: v.x,
                     z: v.z,
                     ang: Math.random()*Math.PI*2,
                     amp: 5 + Math.random() * 15,
                     speed: 0.016 + Math.random() * 0.042
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

  var geom = new THREE.SphereGeometry(15,8,4);
	
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

}

SideClouds = function(){
	
	this.mesh = new THREE.Object3D();
	
	for(var i = 0; i < sideCloudsCount; i++)
	{
		var c = new Cloud();
		
		var a = 2 * angle * i;
		
		c.mesh.position.z = Math.cos(a) * cloudH;
		c.mesh.position.y = Math.sin(a) * cloudH;
		c.mesh.position.x = lCloudsPos;
		
		this.mesh.add(c.mesh);
	}
	
	for(var i = 0; i  < sideCloudsCount; i++)
	{
		var c = new Cloud();
		
		var a = (2 * angle * i) - angle;
		
		c.mesh.position.z = Math.cos(a) * cloudH;
		c.mesh.position.y = Math.sin(a) * cloudH;
		c.mesh.position.x = rCloudsPos;
		
		this.mesh.add(c.mesh);
	}
}
function createSideClouds(){
	sideClouds = new SideClouds();
	scene.add(sideClouds.mesh);
}



cloudRow = function(){
	
  this.clouds = [];
  this.addOrNot = 0;

  this.rot = 0;
	
  this.mesh = new THREE.Object3D();
	
}

cloudRow.prototype.removeRow = function(){
	this.clouds.splice(0);
	
	scene.remove(this.mesh);
}

cloudRow.prototype.addClouds = function(){
	for(var i = 0; i < 3; i++)
  {
	  if(this.clouds.length < 2)
	  {
		  addOrNot = Math.random();
		  if(addOrNot > 0.5){
		  	var c = new Cloud();
		  
		  	c.mesh.position.x = -85 + 85 * i;
		  
		  	this.mesh.add(c.mesh);
		  	this.clouds.push(c);
		  
		  }
	  }
	  else break;
  }
}


function loop(){
	
  requestAnimationFrame(loop);

	
  updateFlamingo();	
  var delta = clock.getDelta();
  mixer.update(delta);

  ground.moveWaves();
  ground.mesh.rotation.x += 0.005;
	
		

	
  sideClouds.mesh.rotation.x += 0.007;

	for(var i = 0; i < 8; i++)
	{
		
		if(cloudRows[i].clouds.length > 0)
		{
			flaPos = flaPos.setFromMatrixPosition( flamingo.matrixWorld );
			cloudRows[i].mesh.getWorldPosition(targetVector);
				for(var j = 0; j < cloudRows[i].clouds.length; j++)
				{
					
					flaPos = flaPos.setFromMatrixPosition( flamingo.matrixWorld );

					cloudRows[i].clouds[j].mesh.getWorldPosition(newTarget);
					if(flaPos.distanceTo(newTarget) < 20 && targetVector.y > 150 && flamingo.visible === true)
					{
						flamingo.visible = false;
						clock.stop();
						alert("You flew " + score + " seconds, but lose... Reload the page to try again.");
					}	
				}
		}
		
		
		cloudRows[i].mesh.rotation.x += 0.009;
		
		cloudRows[i].rot += rotUpdate;
		
		if(cloudRows[i].rot >= 6.18)
		{
		  cloudRows[i].removeRow();
		  cloudRows[i] = new cloudRow();
	  
	  	  cloudRows[i].addClouds();
			
		  cloudRows[i].rot = 0;
		  scene.add(cloudRows[i].mesh);
			
		}
		
		cloudRows[i].mesh.position.z = cloudH * Math.cos(cloudRows[i].rot);
		cloudRows[i].mesh.position.y = -cloudH * Math.sin(cloudRows[i].rot);

	}
	
	if(Math.floor(clock.elapsedTime) > score)
	{
		score = Math.floor(clock.elapsedTime);
		scoreText.innerHTML = "You flew " + score + " seconds.";
	}
		
  renderer.render(scene, camera);
  
}


function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();
  createGround();
  createSideClouds();
	
  for(var i = 0; i < 8; i++){
	  cloudRows[i] = new cloudRow();
	  
	  cloudRows[i].addClouds();
	  cloudRows[i].rot = globalRot * i;
	  
	  scene.add(cloudRows[i].mesh);
	  
  }

  	var loader = new THREE.JSONLoader();
	
	loader.load( 'js/flamingo.js', function( geometry ) {
	var material = new THREE.MeshPhongMaterial( { 
            morphTargets: true, 
            vertexColors: THREE.FaceColors 
          } );
          
          flamingo = new THREE.Mesh(geometry, material);
	  
          flamingo.position.x = -85;
          flamingo.position.y = 930;
	  flamingo.position.z = 480;
          flamingo.scale.set(.3,.3,.3);
	  flamingo.rotateY(Math.PI);

          scene.add(flamingo);
		
		
		
          mixer = new THREE.AnimationMixer(flamingo);
          mixer.clipAction(geometry.animations[0]).setDuration(1).play();} );	
	
	
	
	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	
	scoreText.style.width = 150;
	scoreText.style.height = 100;
	scoreText.innerHTML = "You flew 0 seconds";
	scoreText.style.top = 50 + 'px';
	scoreText.style.left = 50 + 'px';
	document.body.appendChild(scoreText);
	
		
  loop();
}
var fPos, oldPos;

function updateFlamingo(){
	
	
	flamingo.position.x += fPos;
		
		//flamingo.rotation.z += fPos/300;
	if(flamingo.position.x > 100)
		flamingo.position.x = 100;
	else if(flamingo.position.x < -100)
		flamingo.position.x = -100;

	oldPos = fPos;
	 
}

function handleOrientation(event){
	fPos = event.accelerationIncludingGravity.y;
}


window.addEventListener('load', init, false);

