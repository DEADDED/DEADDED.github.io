var cloudPosDelta = 85;

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