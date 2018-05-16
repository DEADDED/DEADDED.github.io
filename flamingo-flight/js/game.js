
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container,  mixer;

var flamingo;
var fPos;

var updateOrNot = true;

var HEIGHT, WIDTH;

var  hemisphereLight, shadowLight;

var ground;

var cloudH = 1046;
var score = 0;

var globalRot = 0.785;
var rotUpdate = 0.008;

var flaPos = new THREE.Vector3();


var cloudRows = [];
var cloudRowsCount = 8;
var cloudPosDelta = 85;

var cloudRowGlobalPosition = new THREE.Vector3();
var cloudGlobalPosition = new THREE.Vector3();

var sideClouds;
var sideCloudsCount = 12;
var angle = 2 * Math.PI / sideCloudsCount;
var lCloudsPos = -250;
var rCloudsPos = - lCloudsPos;

var minCloudBlocksCount = 5;
var maxCLoudBlocksCount = 8;


var clock = new THREE.Clock(false);
clock.start();
var delta = clock.getDelta();


//This function initialises our scene

function init(event){
  
  //window.addEventListener('mousemove', handleMouseMove);

  //event handler for controlling a character using an accelerometer
  window.addEventListener('devicemotion', handleOrientation);

  createScene();
  createLights();
  //createGround();
  //createSideClouds();
  
  //first initialising of each cloud row
  for(var i = 0; i < cloudRowsCount; i++){
	  cloudRows[i] = new cloudRow();
	  
	  cloudRows[i].addClouds();
	  cloudRows[i].rot = globalRot * i;
	  
	  scene.add(cloudRows[i].mesh);
  }

  //loader for flamingo bird
  var loader = new THREE.JSONLoader();
  
  
  //flamingo loading
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
	flamingo.rotateY(Math.PI/4);

  scene.add(flamingo);
    
  //animation mixer for animation handling
  mixer = new THREE.AnimationMixer(flamingo);
  mixer.clipAction(geometry.animations[0]).setDuration(1).play();} );	 
  
  
  //div element for score displaying
	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	
	scoreText.style.width = 150;
	scoreText.style.height = 100;
	scoreText.innerHTML = "Flight time is 0 second.";
	scoreText.style.top = 10 + '%';
	scoreText.style.left = 10 + '%';
	document.body.appendChild(scoreText);
	
		
  loop();
}


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
  scene.fog = new THREE.Fog(0x9290a6, 100,950);
  camera.position.x = 0;
  camera.position.y = 950;
  camera.position.z = 600;
  
  renderer = new THREE.WebGLRenderer({alpha:true});
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

// Handle screen events

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
	
	if(WIDTH < HEIGHT)
		updateOrNot = false;
	else
		updateOrNot = true;
}


// Lights

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0x996881,0xffffff, .9)
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(0, 1200, 1200);
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


//Declaration of a Ground as an object
Ground = function(){
  
  var geom = new THREE.SphereGeometry(1000,30,30);

  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));

  var l = geom.vertices.length;

  this.waves = [];

  for(var i = 0; i < l; i++){

    var v = geom.vertices[i];

    //Each wave is an object with x,y,z coordinations rotaion angel, amplitute and speed of changing
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

//function for waves mooving
Ground.prototype.moveWaves = function(){

  var verts = this.mesh.geometry.vertices;
  var l = verts.length;

  for(var i = 0; i < l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    
    //Assignment to each vertex of the position of each 'wave'
    v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

    vprops.ang += vprops.speed;

  }

  //if 'false' there is no vertices update
  this.mesh.geometry.verticesNeedUpdate = true;

}

function createGround(){
  ground = new Ground();

  ground.mesh.position.x = 0;
  ground.mesh.position.y = 0;
  ground.mesh.position.z = 0;

  scene.add(ground.mesh);
}


//Declaration of a Cloud as an object
Cloud = function(){
  this.mesh = new THREE.Object3D();

  var geom = new THREE.SphereGeometry(15,8,4);
	
  var mat = new THREE.MeshPhongMaterial({
 	color: 0xffffff});

   //Random count of blocks
 var blocksCount = minCloudBlocksCount + Math.floor( Math.random()*(maxCLoudBlocksCount - minCloudBlocksCount));
  
 //Creation of each block
 for(var i = 0; i < blocksCount; i++)
 {
	 var m = new THREE.Mesh(geom, mat);
   
   //Random position for every block
	 m.position.x = i*5 + Math.floor(Math.random() * 5);
	 m.position.y = Math.random()*10;
	 m.position.z = Math.random()*10;
   
   //Random scale too
	 var s = 0.3 + Math.random() * 0.7;
	 m.scale.set(s,s,s);
	 
	 m.castShadow = true;
	 m.receiveShadow = true;
	 
	 this.mesh.add(m)
 }

  //Random rotation around Z axis with a PI/6 pitch
	var rand = 0 - 0.5 + Math.random() * (6 - 0 + 1)
  rand = Math.round(rand);

	this.mesh.rotateZ((Math.PI / 6) * rand);

}


//Declaration of a SideCloud as an object
//The character (flamingo) is never interacting with them
//The clouds are staggered (left - rigth side) around the Ground instance with angular difference of 2 'angle' on each side
SideClouds = function(){
	
	this.mesh = new THREE.Object3D();
  
  //Creaton of left side clouds
	for(var i = 0; i < sideCloudsCount; i++)
	{
		var c = new Cloud();
		
		var a = 2 * angle * i;
		
		c.mesh.position.z = Math.cos(a) * cloudH;
		c.mesh.position.y = Math.sin(a) * cloudH;
		c.mesh.position.x = lCloudsPos;
		
		this.mesh.add(c.mesh);
	}
  
  //Creation of rigth side clouds
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

//Declaration of a cloudRow as an object
//This object represent a row from 0 to 2 clouds
//Clouds are added randomly, 'addOrNot' is for this purpose
cloudRow = function(){
	
  this.clouds = [];
  this.addOrNot = 0;

  this.rot = 0;
	
  this.mesh = new THREE.Object3D();
	
}

//function for removing a row
cloudRow.prototype.removeRow = function(){
	this.clouds.splice(0);
	
	scene.remove(this.mesh);
}

//Adds clouds
cloudRow.prototype.addClouds = function(){
	for(var i = 0; i < 3; i++)
  {
	  if(this.clouds.length < 2)                                      //no more than 2 clouds
	  {
		  addOrNot = Math.random();
		  if(addOrNot > 0.5){
		  	var c = new Cloud();
		  
		  	c.mesh.position.x = -cloudPosDelta + cloudPosDelta * i;     //positioning in a row
		  
		  	this.mesh.add(c.mesh);
		  	this.clouds.push(c);
		  
		  }
	  }
  }
}

//Function for updating each object in a scene
function loop(){
WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
	
  requestAnimationFrame(loop);                                      //update an animation before the next repaint
	if(WIDTH < HEIGHT)
	{
		if(clock.running)
			clock.stop();
		
		container.setAttribute('style', 'opacity: 0');
		document.getElementById('rotate').setAttribute('style', 'opacity: 1');
		return;
	}
 else
 {
  if(clock.running == false && flamingo.visible)
  {
  	clock.start();
	  container.setAttribute('style', 'opacity: 1');
	  document.getElementById('rotate').setAttribute('style', 'opacity: 0');
  }
  	
  updateFlamingo();                                                 //flamingo behavior	
  if(updateOrNot)
  	delta = clock.getDelta();
  mixer.update(delta);                                              //update animation every 'delta' seconds

  ground.moveWaves();
  ground.mesh.rotation.x += 0.005;
		
  sideClouds.mesh.rotation.x += 0.007;

  //clouds rotaion and collision detection
	for(var i = 0; i < cloudRowsCount; i++)
	{
		//if any clouds in a row
		if(cloudRows[i].clouds.length > 0)
		{
			cloudRows[i].mesh.getWorldPosition(cloudRowGlobalPosition);                                     //'cloudRowGlobalPosition' holds global position of each row of clouds
				for(var j = 0; j < cloudRows[i].clouds.length; j++)                                           //cheking collision for every cloud
				{
					flaPos = flaPos.setFromMatrixPosition( flamingo.matrixWorld );

          cloudRows[i].clouds[j].mesh.getWorldPosition(cloudGlobalPosition);                          //'cloudGlobalPosition' holds global position of each cloud
          
          //collision detection
          if(flaPos.distanceTo(cloudGlobalPosition) < 20                                              
              && cloudRowGlobalPosition.y > 150                                                       //this line removes the bug of collision with newly created clouds 
              && flamingo.visible === true)
					{
						flamingo.visible = false;
						clock.stop();
						alert("You have flown " + score + " seconds, but lost... Reload the page to try again.");       //end game message
					}	
				}
		}
		
		
		cloudRows[i].rot += rotUpdate;
    
    //removes a cloud row every lap and makes new one to change a position of obstacles
		if(cloudRows[i].rot >= 6.18)
		{
		  cloudRows[i].removeRow();
		  cloudRows[i] = new cloudRow();
	  
	  	cloudRows[i].addClouds();
			
		  cloudRows[i].rot = 0;
		  scene.add(cloudRows[i].mesh);
			
		}
    
    //circular motion of clouds
		cloudRows[i].mesh.position.z = cloudH * Math.cos(cloudRows[i].rot);
		cloudRows[i].mesh.position.y = -cloudH * Math.sin(cloudRows[i].rot);

	}
  
  //updates the score
	if(Math.floor(clock.elapsedTime) > score || score > clock.elapsedTime)
	{
		if(Math.floor(clock.elapsedTime) > score)
			score = Math.floor(clock.elapsedTime);
		if(score > Math.floor(clock.elapsedTime))
			score += score.Math.floor(clock.elapsedTime);
		scoreText.innerHTML = "Flight time is " + score + " seconds.";
	}

  //increases the speed of rotation of clouds	
  if(score % 5 === 0)
  {
  	rotUpdate+=0.00001;
  }
	  
   	
  renderer.render(scene, camera);    //scene rendering
 }

}

//updates the position of flamingo and keeps it in [-100; 100]
function updateFlamingo(){
		
	flamingo.position.x += fPos;

	if(flamingo.position.x > 100)
		flamingo.position.x = 100;
	else if(flamingo.position.x < -100)
		flamingo.position.x = -100;

	 
}

//getting data from the accelerometer
function handleOrientation(event){
	fPos = event.accelerationIncludingGravity.y;
}

//invokes 'init' function when window is loaded
window.addEventListener('load', init, false);
