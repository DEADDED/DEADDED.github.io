var cloudH = 1046;
var lCloudsPos = -250;
var rCloudsPos = - lCloudsPos;

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
    
